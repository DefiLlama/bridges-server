// import { ethers } from "ethers";
// import { getClient, getTransactionBlocks } from "../../helpers/sui";
// import { EventData } from "../../utils/types";
// import { SuiEvent, SuiObjectChange } from "@mysten/sui.js/dist/cjs/client";
// import { normalizeSuiAddress, SUI_TYPE_ARG } from "@mysten/sui.js/utils";

// const wormholeMessageEventType =
//   "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::publish_message::WormholeMessage";
// const tokenBridgeAddress = "0xc57508ee0d4595e5a8728974a4a93a787d38f339757230d441e895422c07aba9";
// const originalTokenBridgePackageId = "0x26efee2b51c911237888e5dc6702868abca3c7ac12c53f76ef8eba0697695e3d";

// /**
//  * Retrieves Sui events from a given checkpoint range using the token bridge.
//  * Optimized to make as few RPC calls as possible.
//  * @param fromCheckpoint The starting checkpoint to retrieve events from.
//  * @param toCheckpoint The ending checkpoint to retrieve events from.
//  * @returns An array of EventData objects representing the events that occurred within the given checkpoint range.
//  */
// export const getSuiEvents = async (fromCheckpoint: number, toCheckpoint: number): Promise<EventData[]> => {
//   const events: EventData[] = [];
//   const txBlocks = await getTransactionBlocks(fromCheckpoint, toCheckpoint, tokenBridgeAddress);
//   for (const txBlock of txBlocks) {
//     if (
//       txBlock.effects?.status.status !== "success" ||
//       !txBlock.checkpoint ||
//       !txBlock.objectChanges ||
//       txBlock.transaction?.data.transaction.kind !== "ProgrammableTransaction"
//     ) {
//       continue;
//     }
//     const transactions = txBlock.transaction.data.transaction.transactions;
//     for (const tx of transactions) {
//       const moveCall = "MoveCall" in tx && tx.MoveCall;
//       if (!moveCall || moveCall.package !== originalTokenBridgePackageId) {
//         continue;
//       }
//       if (
//         (moveCall.module === "complete_transfer_with_payload" && moveCall.function === "authorize_transfer") ||
//         (moveCall.module === "complete_transfer" && moveCall.function === "authorize_transfer")
//       ) {
//         const token = moveCall.type_arguments![0];
//         // search backwards for the parse_and_verify call
//         const parseAndVerifyTx = transactions
//           .slice(
//             0,
//             transactions.findIndex((value) => value === tx)
//           )
//           .reverse()
//           .find(
//             (tx) => "MoveCall" in tx && tx.MoveCall.module === "vaa" && tx.MoveCall.function === "parse_and_verify"
//           );
//         if (!parseAndVerifyTx || !("MoveCall" in parseAndVerifyTx)) {
//           continue;
//         }
//         const vaaArg = parseAndVerifyTx.MoveCall.arguments?.[1];
//         if (!vaaArg || typeof vaaArg !== "object" || !("Input" in vaaArg)) {
//           continue;
//         }
//         const vaaInput = txBlock.transaction.data.transaction.inputs[vaaArg.Input];
//         if (!vaaInput || vaaInput.type !== "pure" || vaaInput.valueType !== "vector<u8>") {
//           continue;
//         }
//         const vaa = Buffer.from(vaaInput.value as number[]);
//         const sigStart = 6;
//         const numSigners = vaa[5];
//         const sigLength = 66;
//         const body = vaa.subarray(sigStart + sigLength * numSigners);
//         const payload = body.subarray(51);
//         const type = payload.readUInt8(0);
//         if (type !== 1 && type !== 3) {
//           continue;
//         }
//         const amount = await denormalizeAmount(token, ethers.BigNumber.from(payload.subarray(1, 33)));
//         const to = `0x${payload.subarray(67, 99).toString("hex")}`;
//         const event: EventData = {
//           blockNumber: Number(txBlock.checkpoint),
//           txHash: txBlock.digest,
//           // Wrapped tokens are minted from the zero address on Ethereum
//           // Override the from address to be the zero address for consistency
//           from: isWrappedToken(token, txBlock.objectChanges) ? ethers.constants.AddressZero : tokenBridgeAddress,
//           to,
//           token,
//           amount,
//           isDeposit: false,
//         };
//         events.push(event);
//       }
//       if (
//         ((moveCall.module === "transfer_tokens_with_payload" && moveCall.function === "transfer_tokens_with_payload") ||
//           (moveCall.module === "transfer_tokens" && moveCall.function === "transfer_tokens")) &&
//         txBlock.events
//       ) {
//         const token = tx.MoveCall.type_arguments![0];
//         const payload = getWormholeMessagePayload(txBlock.events);
//         const originChain = payload.readUint16BE(65);
//         const toChain = payload.readUInt16BE(99);
//         const amount = await denormalizeAmount(token, ethers.BigNumber.from(payload.subarray(1, 33)));
//         const isWrapped = isWrappedToken(token, txBlock.objectChanges);
//         const event: EventData = {
//           blockNumber: Number(txBlock.checkpoint),
//           txHash: txBlock.digest,
//           from: txBlock.transaction.data.sender,
//           // if this is a wrapped token being burned and not being sent to its origin chain,
//           // then it should be included in the volume by fixing the to address
//           to: !isWrapped || originChain !== toChain ? tokenBridgeAddress : ethers.constants.AddressZero,
//           token,
//           amount,
//           isDeposit: !isWrapped,
//         };
//         events.push(event);
//       }
//     }
//   }
//   return events;
// };

// const getWormholeMessagePayload = (events: SuiEvent[]): Buffer => {
//   const filtered = events.filter((event) => {
//     return event.type === wormholeMessageEventType;
//   });
//   // TODO: support multiple transfers in a single txBlock
//   if (filtered.length !== 1) {
//     throw new Error(`Expected exactly one wormhole message event, found ${filtered.length}`);
//   }
//   return Buffer.from((filtered[0].parsedJson as any).payload);
// };

// const tokenDecimalsCache: { [token: string]: number } = {};

// const getTokenDecimals = async (token: string): Promise<number> => {
//   if (token in tokenDecimalsCache) {
//     return tokenDecimalsCache[token];
//   }
//   const client = getClient();
//   const coinMetadata = await client.getCoinMetadata({ coinType: token });
//   if (coinMetadata === null) {
//     throw new Error(`Failed to get coin metadata for ${token}`);
//   }
//   const { decimals } = coinMetadata;
//   tokenDecimalsCache[token] = decimals;
//   return decimals;
// };

// const denormalizeAmount = async (token: string, amount: ethers.BigNumber): Promise<ethers.BigNumber> => {
//   const decimals = await getTokenDecimals(token);
//   if (decimals > 8) {
//     return amount.mul(ethers.BigNumber.from(10).pow(decimals - 8));
//   }
//   return amount;
// };

// const isWrappedToken = (token: string, objectChanges: SuiObjectChange[]) => {
//   const split = token.split("::");
//   if (split.length !== 3) {
//     throw new Error(`Invalid token ${token}`);
//   }
//   const normalized = token === SUI_TYPE_ARG ? token : `${normalizeSuiAddress(split[0])}::${split[1]}::${split[2]}`;
//   const nativeKey = `0x2::dynamic_field::Field<${originalTokenBridgePackageId}::token_registry::Key<${normalized}>, ${originalTokenBridgePackageId}::native_asset::NativeAsset<${normalized}>>`;
//   const wrappedKey = `0x2::dynamic_field::Field<${originalTokenBridgePackageId}::token_registry::Key<${normalized}>, ${originalTokenBridgePackageId}::wrapped_asset::WrappedAsset<${normalized}>>`;
//   const value = objectChanges.find(
//     (change) => change.type === "mutated" && [nativeKey, wrappedKey].includes(change.objectType)
//   );
//   if (!value) {
//     throw new Error(`Failed to find object change for token ${normalized}`);
//   }
//   return value.type === "mutated" && value.objectType === wrappedKey;
// };
