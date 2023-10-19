import { PublicKey, ParsedInstruction, PartiallyDecodedInstruction, ParsedTransactionWithMeta } from "@solana/web3.js";
import { getParsedTransactions } from "../../helpers/solana";
import { EventData } from "../../utils/types";
import { contractAddresses } from "./consts";
import * as ethers from "ethers";
import * as bs58 from "bs58";
import { deserialize } from "borsh";

const coreBridge = new PublicKey(contractAddresses["solana"].coreBridge);
const tokenBridge = new PublicKey(contractAddresses["solana"].tokenBridge);
const tokenProgram = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

const mintAuthority = "BCD75RNBHrJJpW4dXVagL5mPjzRLnVZq4YirJdjEYMV7";
const transferAuthority = "7oPa2PHQdZmjSPqvpZN7MQxnC7Dcf3uL4oLqknGLk2S3";
const custodyAuthority = "GugU1tP7doLeTw9hQP51xRJyS8Da1fWxuiy2rVrnMD2m";

enum CoreBridgeIxId {
  PostMessage = 0x1,
}

enum TokenBridgeIxId {
  CompleteNative = 0x2,
  CompleteWrapped,
  TransferWrapped,
  TransferNative,
  CompleteNativeWithPayload = 0x9,
  CompleteWrappedWithPayload,
  TransferWrappedWithPayload,
  TransferNativeWithPayload,
}

const PostMessageDataSchema = {
  struct: {
    nonce: "u32",
    payload: { array: { type: "u8" } },
    consistency_level: "u8",
  },
};

/**
 * Retrieves Solana events from a given slot range using the token bridge.
 * @param fromSlot The starting slot to retrieve events from.
 * @param toSlot The ending slot to retrieve events from.
 * @returns An array of EventData objects representing the events that occurred within the given slot range.
 */
export const getSolanaEvents = async (fromSlot: number, toSlot: number) => {
  const txs = await getParsedTransactions(fromSlot, toSlot, tokenBridge);
  const events = txs.reduce((acc, tx) => {
    if (!tx || !tx.blockTime || tx.meta?.err) {
      return acc;
    }
    // handle the case where the token bridge instruction is a top-level instruction
    tx.transaction.message.instructions.forEach((ix: any, index: any) => {
      if (!isTokenBridgeIx(ix)) {
        return;
      }
      const innerIx = tx.meta?.innerInstructions?.find((innerIx: any) => innerIx.index === index);
      if (!innerIx || innerIx.instructions.length === 0) {
        return;
      }
      const event = getEventData(tx, ix, innerIx.instructions);
      if (event) {
        acc.push(event);
      }
    });
    // handle the case where the token bridge instruction is an inner instruction
    tx.meta?.innerInstructions?.forEach((innerIx: any) => {
      innerIx.instructions.forEach((ix: any, index: any) => {
        if (isTokenBridgeIx(ix)) {
          const event = getEventData(tx, ix, innerIx.instructions.slice(index + 1));
          if (event) {
            acc.push(event);
          }
        }
      });
    });
    return acc;
  }, [] as EventData[]);
  return events;
};

const getEventData = (
  tx: ParsedTransactionWithMeta,
  tokenBridgeIx: PartiallyDecodedInstruction,
  innerIxs: (ParsedInstruction | PartiallyDecodedInstruction)[]
): EventData | undefined => {
  const data = bs58.decode(tokenBridgeIx.data);
  if (data.length === 0) {
    return;
  }
  const tokenBridgeIxId = data[0];
  const txHash = tx.transaction.signatures[0];
  const blockNumber = tx.slot;
  // search the inner instructions for token transfer instructions to get the event data
  switch (tokenBridgeIxId) {
    case TokenBridgeIxId.TransferNative:
    case TokenBridgeIxId.TransferNativeWithPayload: {
      const transferIx = innerIxs.find(
        (ix): ix is ParsedInstruction => isTransferIx(ix) && ix.parsed.info?.authority === transferAuthority
      );
      if (transferIx) {
        return {
          blockNumber,
          txHash,
          to: transferIx.parsed.info?.destination,
          from: transferIx.parsed.info?.source,
          token: tokenBridgeIx.accounts[3]?.toString() || "", // mint account
          amount: ethers.BigNumber.from(transferIx.parsed.info?.amount),
          isDeposit: true,
        };
      }
      break;
    }
    case TokenBridgeIxId.TransferWrapped:
    case TokenBridgeIxId.TransferWrappedWithPayload: {
      const burnIx = innerIxs.find(
        (ix): ix is ParsedInstruction => isBurnIx(ix) && ix.parsed.info?.authority === transferAuthority
      );
      const coreBridgeIx = innerIxs.find(
        (ix): ix is PartiallyDecodedInstruction =>
          ix.programId.equals(coreBridge) && (ix as PartiallyDecodedInstruction).data !== undefined
      );
      const coreBridgeIxData = coreBridgeIx?.data ? Buffer.from(bs58.decode(coreBridgeIx.data)) : undefined;
      if (
        burnIx &&
        coreBridgeIxData &&
        coreBridgeIxData.length > 0 &&
        coreBridgeIxData[0] === CoreBridgeIxId.PostMessage
      ) {
        const postMessageData: any = deserialize(PostMessageDataSchema, coreBridgeIxData.subarray(1));
        const payload = Buffer.from(postMessageData.payload);
        const originChain = payload.readUint16BE(65);
        const toChain = payload.readUInt16BE(99);
        // if this is a wrapped token being burned and not being sent to its origin chain,
        // then it should be included in the volume by fixing the `to` address
        // https://docs.wormhole.com/wormhole/explore-wormhole/vaa#token-transfer
        const to = toChain !== originChain ? tokenBridge.toString() : ethers.constants.AddressZero;
        return {
          blockNumber,
          txHash,
          to,
          from: burnIx.parsed.info?.account,
          token: tokenBridgeIx.accounts[4]?.toString() || "", // mint account
          amount: ethers.BigNumber.from(burnIx.parsed.info?.amount),
          isDeposit: false,
        };
      }
      break;
    }
    case TokenBridgeIxId.CompleteNative:
    case TokenBridgeIxId.CompleteNativeWithPayload: {
      // TODO: this doesn't handle the case where the fee recipient is not the destination
      // in this case there will be another transfer instruction with the fee recipient as the destination
      const transferIx = innerIxs.find(
        (ix): ix is ParsedInstruction =>
          isTransferIx(ix) &&
          ix.parsed.info?.authority === custodyAuthority &&
          (tokenBridgeIxId === TokenBridgeIxId.CompleteNativeWithPayload ||
            ix.parsed.info?.destination === tokenBridgeIx.accounts[6].toString())
      );
      if (transferIx) {
        const mintAccountIndex = tokenBridgeIxId === TokenBridgeIxId.CompleteNative ? 8 : 9;
        return {
          blockNumber,
          txHash,
          to: transferIx.parsed.info?.destination,
          from: transferIx.parsed.info?.source,
          token: tokenBridgeIx.accounts[mintAccountIndex]?.toString() || "", // mint account
          amount: ethers.BigNumber.from(transferIx.parsed.info?.amount),
          isDeposit: false,
        };
      }
      break;
    }
    case TokenBridgeIxId.CompleteWrapped:
    case TokenBridgeIxId.CompleteWrappedWithPayload: {
      // TODO: this doesn't handle the case where the fee recipient is not the destination
      // in this case there will be another mint instruction with the fee recipient as the destination
      const mintToIx = innerIxs.find(
        (ix): ix is ParsedInstruction =>
          isMintToIx(ix) &&
          ix.parsed.info?.mintAuthority === mintAuthority &&
          (tokenBridgeIxId === TokenBridgeIxId.CompleteWrappedWithPayload ||
            ix.parsed.info?.account === tokenBridgeIx.accounts[6].toString())
      );
      if (mintToIx) {
        return {
          blockNumber,
          txHash,
          to: mintToIx.parsed.info?.account,
          // to be consistent with the ethereum adapter,
          // we set the `from` address to the zero address for minted tokens
          from: ethers.constants.AddressZero,
          token: mintToIx.parsed.info?.mint,
          amount: ethers.BigNumber.from(mintToIx.parsed.info?.amount),
          isDeposit: false,
        };
      }
      break;
    }
  }
};

const isTokenBridgeIx = (ix: ParsedInstruction | PartiallyDecodedInstruction): ix is PartiallyDecodedInstruction =>
  ix.programId.equals(tokenBridge) && (ix as PartiallyDecodedInstruction).accounts !== undefined;

const isMintToIx = (ix: ParsedInstruction | PartiallyDecodedInstruction): ix is ParsedInstruction =>
  isTxOfType(ix, tokenProgram, "mintTo");

const isBurnIx = (ix: ParsedInstruction | PartiallyDecodedInstruction): ix is ParsedInstruction =>
  isTxOfType(ix, tokenProgram, "burn");

const isTransferIx = (ix: ParsedInstruction | PartiallyDecodedInstruction): ix is ParsedInstruction =>
  isTxOfType(ix, tokenProgram, "transfer");

const isTxOfType = (ix: ParsedInstruction | PartiallyDecodedInstruction, programId: PublicKey, type: string) =>
  (ix as ParsedInstruction).parsed?.type === type && ix.programId.equals(programId);
