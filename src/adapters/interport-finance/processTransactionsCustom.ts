import { getLogs } from "@defillama/sdk/build/util";
import { ethers, BigNumber } from "ethers";
import { Chain } from "@defillama/sdk/build/general";
import { get } from "lodash";
import { ContractEventParams, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { EventData } from "../../utils/types";
import { getProvider } from "@defillama/sdk/build/general";
import { PromisePool } from "@supercharge/promise-pool";
import { getConnection } from "../../helpers/solana";
import web3, { Connection, PartiallyDecodedInstruction, PublicKey } from "@solana/web3.js";
import { incrementGetLogsCount } from "../../utils/cache";

const EventKeyTypes = {
    blockNumber: "number",
    txHash: "string",
    from: "string",
    to: "string",
    token: "string",
    amount: "object",
} as {
    [key: string]: string;
};

const setTransferEventParams = (isDeposit: boolean, target: string) => {
    const topic = "Transfer(address,address,uint256)";
    const logKeys = {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
        token: "address",
    };
    const argKeys = {
        from: "from",
        to: "to",
        amount: "value",
    };
    const abi = ["event Transfer(address indexed from, address indexed to, uint256 value)"];
    let topics = [];
    if (isDeposit) {
        topics = [ethers.utils.id("Transfer(address,address,uint256)"), null, ethers.utils.hexZeroPad(target, 32)];
    } else {
        topics = [ethers.utils.id("Transfer(address,address,uint256)"), ethers.utils.hexZeroPad(target, 32)];
    }
    target = null as any;
    return { topic, logKeys, argKeys, abi, topics, target };
};

export const getTxDataFromEVMEventLogsCustom = async (
    adapterName: string,
    chainContractsAreOn: Chain,
    fromBlock: number,
    toBlock: number,
    paramsArray: (ContractEventParams | PartialContractEventParams)[]
) => {
    let accEventData = [] as EventData[];
    const getLogsPromises = Promise.all(
        paramsArray.map(async (params) => {
            let {
                target,
                topic,
                abi,
                logKeys,
                argKeys,
                txKeys,
                topics,
                isDeposit,
                chain,
                isTransfer,
                fixedEventData,
                inputDataExtraction,
                selectIndexesFromArrays,
                functionSignatureFilter,
                filter,
                mapTokens,
                getTokenFromReceipt,
                argGetters,
            } = params;
            // if this is ever used, need to also overwrite fromBlock and toBlock
            const overriddenChain = chain ? chain : chainContractsAreOn;
            if (isTransfer) {
                if (!target) {
                    throw new Error(
                        `${adapterName} adapter records Transfer events but no ${target} is given for them in adapter.`
                    );
                }
                // can make following function include a chain parameter if needed
                ({ topic, logKeys, argKeys, abi, topics, target } = setTransferEventParams(isDeposit, target));
                params = {
                    ...params,
                    topic,
                    logKeys,
                    argKeys,
                    abi,
                    topics,
                    target,
                };
            }
            if (!logKeys) {
                logKeys = isDeposit
                    ? {
                        blockNumber: "blockNumber",
                        txHash: "transactionHash",
                        to: "address",
                    }
                    : {
                        blockNumber: "blockNumber",
                        txHash: "transactionHash",
                        from: "address",
                    };
            }
            if (!(topic && abi)) {
                throw new Error(
                    `adapter ${adapterName} with target ${target} either is missing param(s) or isTransfer param is false.`
                );
            }

            const iface = new ethers.utils.Interface(abi);
            let data = {} as any;
            let logs = [] as any[];
            for (let i = 0; i < 5; i++) {
                try {
                    logs = (
                        await getLogs({
                            target: target!,
                            topic: topic,
                            keys: [],
                            fromBlock: fromBlock,
                            toBlock: toBlock,
                            topics: topics as string[],
                            chain: overriddenChain,
                        })
                    ).output;
                    incrementGetLogsCount(adapterName, overriddenChain);
                    break;
                } catch (e) {
                    if (i >= 4) {
                        console.error(target, e);
                    } else {
                        continue;
                    }
                }
            }

            let dataKeysToFilter = [] as number[];
            const provider = getProvider(overriddenChain) as any;
            const { results, errors } = await PromisePool.withConcurrency(20)
                .for(logs)
                .process(async (txLog: any, i) => {
                    data[i] = data[i] || {};
                    data[i]["isDeposit"] = isDeposit;
                    Object.entries(logKeys!).map(([eventKey, logKey]) => {
                        const value = txLog[logKey];
                        if (typeof value !== EventKeyTypes[eventKey]) {
                            throw new Error(
                                `Type of ${eventKey} retrieved using ${logKey} is ${typeof value} when it must be ${
                                    EventKeyTypes[eventKey]
                                }.`
                            );
                        }
                        data[i][eventKey] = value;
                    });
                    let parsedLog = {} as any;
                    try {
                        parsedLog = iface.parseLog({
                            topics: txLog.topics,
                            data: txLog.data,
                        });
                    } catch (e) {
                        console.error(
                            `WARNING: Unable to parse log for ${adapterName}, SKIPPING TX with hash ${txLog.transactionHash} ${chainContractsAreOn}`
                        );
                        dataKeysToFilter.push(i);
                        return;
                    }
                    if (argKeys) {
                        try {
                            const args = parsedLog?.args;
                            if (args === undefined || args.length === 0) {
                                throw new Error(
                                    `Unable to get log args for ${adapterName} with arg keys ${argKeys} ${chainContractsAreOn}.`
                                );
                            }
                            Object.entries(argKeys).map(([eventKey, argKey]) => {
                                // @ts-ignore
                                const value = argGetters?.[eventKey](args) || get(args, argKey);
                                if (typeof value !== EventKeyTypes[eventKey] && !Array.isArray(value)) {
                                    throw new Error(
                                        `Type of ${eventKey} retrieved using ${argKey} is ${typeof value} when it must be ${
                                            EventKeyTypes[eventKey]
                                        }.`
                                    );
                                }
                                data[i][eventKey] = value;
                            });
                            if (filter?.includeArg) {
                                let toFilter = true;
                                const includeArgArray = filter.includeArg;
                                includeArgArray.map((argMappingToInclude) => {
                                    const argKeyToInclude = Object.keys(argMappingToInclude)[0];
                                    const argValueToInclude = Object.values(argMappingToInclude)[0];
                                    if (
                                        args[argKeyToInclude] === argValueToInclude ||
                                        (
                                            // custom logic
                                            args[argKeyToInclude] instanceof BigNumber &&
                                            <any>argValueToInclude instanceof BigNumber &&
                                            (<BigNumber>args[argKeyToInclude]).eq(argValueToInclude)
                                        )
                                    ) {
                                        toFilter = false;
                                    }
                                });
                                if (toFilter) dataKeysToFilter.push(i);
                            }
                            if (filter?.excludeArg) {
                                let toFilter = false;
                                const excludeArgArray = filter.excludeArg;
                                excludeArgArray.map((argMappingToExclude) => {
                                    const argKeyToExclude = Object.keys(argMappingToExclude)[0];
                                    const argValueToExclude = Object.values(argMappingToExclude)[0];
                                    if (
                                        args[argKeyToExclude] === argValueToExclude ||
                                        (
                                            // custom logic
                                            args[argKeyToExclude] instanceof BigNumber &&
                                            <any>argValueToExclude instanceof BigNumber &&
                                            (<BigNumber>args[argKeyToExclude]).eq(argValueToExclude)
                                        )
                                    ) {
                                        toFilter = true;
                                    }
                                });
                                if (toFilter) dataKeysToFilter.push(i);
                            }
                        } catch (error: any) {
                            console.error(
                                `Unable to get log args for ${adapterName} with arg keys ${argKeys}. SKIPPING TX with hash ${txLog.transactionHash} ${chainContractsAreOn}
                Error: ${error?.message}
                `
                            );
                            return;
                        }
                    }
                    if (txKeys) {
                        const tx = await provider.getTransaction(txLog.transactionHash);
                        if (!tx) {
                            console.error(`WARNING: Unable to get transaction data for ${adapterName}, SKIPPING tx.`);
                            dataKeysToFilter.push(i);
                        } else {
                            Object.entries(txKeys).map(([eventKey, logKey]) => {
                                const value = tx[logKey];
                                if (typeof value !== EventKeyTypes[eventKey]) {
                                    throw new Error(
                                        `Type of ${eventKey} retrieved using ${logKey} is ${typeof value} when it must be ${
                                            EventKeyTypes[eventKey]
                                        }.`
                                    );
                                }
                                data[i][eventKey] = value;
                            });
                        }
                    }
                    if (filter?.includeTxData) {
                        const tx = await provider.getTransaction(txLog.transactionHash);
                        if (!tx) {
                            console.error(`WARNING: Unable to get transaction data for ${adapterName}, SKIPPING tx.`);
                            dataKeysToFilter.push(i);
                        } else {
                            let toFilter = true;
                            const includeTxDataArray = filter.includeTxData;
                            includeTxDataArray.map((txMappingToInclude) => {
                                const txKeyToInclude = Object.keys(txMappingToInclude)[0];
                                const txValueToInclude = Object.values(txMappingToInclude)[0];
                                if (tx[txKeyToInclude] === txValueToInclude || tx[txKeyToInclude]?.toLowerCase() === txValueToInclude) {
                                    toFilter = false;
                                }
                            });
                            if (toFilter) dataKeysToFilter.push(i);
                        }
                    }
                    if (getTokenFromReceipt && getTokenFromReceipt.token) {
                        const txReceipt = await provider.getTransactionReceipt(txLog.transactionHash);
                        if (!txReceipt) {
                            console.error(`WARNING: Unable to get transaction receipt for ${adapterName}, SKIPPING tx.`);
                            dataKeysToFilter.push(i);
                        } else {
                            const logs = txReceipt.logs;
                            const filteredLogs = logs.filter((log: any) => {
                                const topics = log.topics;
                                let isTransfer = false;
                                topics.map((topic: string) => {
                                    if (topic.slice(0, 8) === "0xddf252") {
                                        isTransfer = true;
                                    }
                                });
                                return isTransfer;
                            });
                            if (filteredLogs.length === 0) {
                                if (!getTokenFromReceipt.native) {
                                    console.error(
                                        `Warning: Transaction receipt for ${adapterName} contained no token transfers and native address was not provided, SKIPPING tx.`
                                    );
                                    dataKeysToFilter.push(i);
                                } else {
                                    const tx = await provider.getTransaction(txLog.transactionHash);
                                    if (!tx) {
                                        console.error(`WARNING: Unable to get transaction data for ${adapterName}, SKIPPING tx.`);
                                        dataKeysToFilter.push(i);
                                    } else {
                                        const amount = tx.value;
                                        const token = getTokenFromReceipt.native;
                                        data[i].amount = amount;
                                        data[i].token = token;
                                    }
                                }
                            } else {
                                const firstLog = filteredLogs[0];
                                const address = firstLog.address;
                                data[i].token = address;
                                if (getTokenFromReceipt.amount) {
                                    const amountData = firstLog.data;
                                    const bnAmount = ethers.BigNumber.from(amountData);
                                    data[i].amount = bnAmount;
                                }
                            }
                            if (filteredLogs.length > 1) {
                                console.error(
                                    `Warning: Transaction receipt for ${adapterName} contained multiple token transfers, retrieving first token only.`
                                );
                            }
                        }
                    }
                    /*
                    type FunctionSignatureFilter = {
                      includeFunctionSignature?: string[]  // require initial 8 characters of input data be one of those supplied in array (this is incorrect, should be changed to be 10 characters)
                      excludeFunctionSignature?: string[]
                      }
                    */
                    if (functionSignatureFilter) {
                        const tx = await provider.getTransaction(txLog.transactionHash);
                        if (!tx) {
                            console.error(`WARNING: Unable to get transaction data for ${adapterName}, SKIPPING tx.`);
                            dataKeysToFilter.push(i);
                            return;
                        } else {
                            const signature = tx.data.slice(0, 8);
                            if (
                                functionSignatureFilter.includeSignatures &&
                                !functionSignatureFilter.includeSignatures.includes(signature)
                            ) {
                                dataKeysToFilter.push(i);
                                return;
                            }
                            if (
                                functionSignatureFilter.excludeSignatures &&
                                functionSignatureFilter.excludeSignatures.includes(signature)
                            ) {
                                dataKeysToFilter.push(i);
                                return;
                            }
                        }
                    }
                    if (inputDataExtraction) {
                        const tx = await provider.getTransaction(txLog.transactionHash);
                        try {
                            let inputData = [] as any;
                            if (inputDataExtraction.useDefaultAbiEncoder) {
                                inputData = ethers.utils.defaultAbiCoder.decode(
                                    inputDataExtraction.inputDataABI,
                                    ethers.utils.hexDataSlice(tx.data, 4)
                                );
                            } else {
                                const iface = new ethers.utils.Interface(inputDataExtraction.inputDataABI);
                                inputData = iface.decodeFunctionData(inputDataExtraction.inputDataFnName || "", tx.data);
                            }
                            Object.entries(inputDataExtraction.inputDataKeys).map(([eventKey, inputDataKey]) => {
                                let value = "" as any;
                                if (inputDataExtraction?.useDefaultAbiEncoder) {
                                    value = inputData[parseInt(inputDataKey)];
                                } else {
                                    value = inputData[inputDataKey];
                                }
                                if (typeof value !== EventKeyTypes[eventKey]) {
                                    throw new Error(
                                        `Type of ${eventKey} retrieved using ${inputDataKey} with inputDataExtraction is ${typeof value} when it must be ${
                                            EventKeyTypes[eventKey]
                                        }.`
                                    );
                                }
                                data[i][eventKey] = value;
                            });
                        } catch (e) {
                            console.error(`Unable to extract Input Data. Check this transaction: ${txLog.transactionHash}`);
                            dataKeysToFilter.push(i);
                            return;
                        }
                    }
                    if (selectIndexesFromArrays) {
                        Object.entries(selectIndexesFromArrays).map(([eventKey, value]) => {
                            if (!Array.isArray(data[i][eventKey])) {
                                throw new Error(
                                    `${eventKey} is not an array, but it has been specified as being one in 'selectIndexesFromArrays' in adapter.`
                                );
                            }
                            const extractedValue = data[i][eventKey][parseInt(value)];
                            data[i][eventKey] = extractedValue;
                        });
                    }
                    if (mapTokens) {
                        const map = mapTokens;
                        const token = data[i].token;
                        if (token && map[token]) {
                            data[i].token = map[token];
                        }
                    }
                    if (fixedEventData) {
                        Object.entries(fixedEventData).map(([eventKey, value]) => {
                            if (typeof value !== EventKeyTypes[eventKey]) {
                                throw new Error(
                                    `Type of ${eventKey} in fixedEventData is ${typeof value} when it must be ${EventKeyTypes[eventKey]}.`
                                );
                            }
                            data[i][eventKey] = value;
                        });
                    }
                });

            if (errors.length > 0) {
                console.error("Errors in getTxDataFromEVMEventLogs", errors);
            }

            dataKeysToFilter.map((key) => {
                delete data[key];
            });

            const eventData = Object.values(data) as EventData[];

            const filteredData = eventData.filter((log) => {
                let toFilter = false;
                toFilter =
                    toFilter ||
                    (filter?.excludeFrom?.includes(log.from) ?? false) ||
                    (filter?.excludeTo?.includes(log.to) ?? false) ||
                    (filter?.excludeToken?.includes(log.token) ?? false);
                toFilter =
                    toFilter ||
                    !(filter?.includeFrom?.includes(log.from) ?? true) ||
                    !(filter?.includeTo?.includes(log.to) ?? true) ||
                    !(filter?.includeToken?.includes(log.token) ?? true);
                return !toFilter;
            });
            accEventData = [...accEventData, ...filteredData];
        })
    );
    await getLogsPromises;

    return accEventData;
};

export async function getTxDataFromSolana (startSlot: number, endSlot: number): Promise<EventData[]> {
  const eventData = []
  const connection = getConnection();
  const FEE_RECEIVERS = ["J84sWWdRQBUVfeMBDEyQty2qdSXVL1rm4YQPrc4gwEUt", "GX2BHPzW9P4CcWFyh4QhKw7EAaHwS4mGvpk3vupwMygr"]
  const TOKEN_MESSENGER_MINTER_ADDRESS =
    "CCTPiPYPc6AsJuwueEnWgSgucamXDZwBd53dQ11YiKX3";
  const BRIDGE_PROGRAM_ID = 'Ccip842gzYHhvdDkSyi2YVCoAWPbYJoApMFzSxQroE9C';

  const transactions = await Promise.all(FEE_RECEIVERS.map(async (address) => getTransactionListForAddress(startSlot, endSlot, address, connection)));

  for (const { signature } of transactions.flat(1)) {
    try {
      const transaction = await connection.getParsedTransaction(
        signature,
        {
          commitment: "confirmed",
          maxSupportedTransactionVersion: 0
        }
      );

      if(!transaction) {
        continue;
      }

      const instructions = transaction.transaction.message.instructions;
      let parsedData

      const cctpIx = instructions.find((ix: any) =>
        ix.programId.equals(new PublicKey(TOKEN_MESSENGER_MINTER_ADDRESS))
      ) as PartiallyDecodedInstruction;

      if (cctpIx) {
        parsedData = parseCctpDepositInstruction(
          Buffer.from(base58decode(cctpIx.data))
        );

        if (!parsedData) {
          continue;
        }

        parsedData.from = cctpIx.accounts[1].toString();
      }

      const ccipIx = instructions.find((ix: any) =>
        ix.programId.equals(new PublicKey(BRIDGE_PROGRAM_ID))
      ) as PartiallyDecodedInstruction;

      if (ccipIx) {
        parsedData = parseCcipDepositInstruction(
          Buffer.from(base58decode(ccipIx.data))
        );

        if (!parsedData) {
          continue;
        }

        parsedData.from = transaction.transaction.message.accountKeys[0].pubkey.toString()
      }

      eventData.push({
        blockNumber: transaction.slot,
        txHash: signature,
        from: parsedData.from,
        to: parsedData.toAddress,
        token: parsedData.token,
        amount: ethers.BigNumber.from(parsedData.amount),
        isDeposit: true,
      });

    } catch{}
  }

  return eventData;
}

async function getTransactionListForAddress(startSlot: number, endSlot: number, address: string, connection: Connection) {
  try {
  const pageSize = 100;
  const transactions = [];
  let before: string | undefined = undefined;
  let done = false;

  while (!done) {
    const opts: { limit: number; before?: string } = { limit: pageSize };
    if (before) opts.before = before;

    const sigsPage = await connection.getSignaturesForAddress(
      new web3.PublicKey(address),
      opts,
      'confirmed'
    );

    if (sigsPage.length === 0) break;

    for (const sig of sigsPage) {
      if (sig.slot > endSlot) {
        continue;
      }

      if (sig.slot < startSlot) {
        done = true;
        break;
      }

      transactions.push(sig);
    }

    before = sigsPage[sigsPage.length - 1].signature;

    if (sigsPage[sigsPage.length - 1].slot < startSlot) {
      break;
    }
  }

  return transactions
  } catch {
    return []
  }
}

function parseCctpDepositInstruction (data: Buffer): any {
  const USDC_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

  const TARGET_DISCRIMINATOR = Uint8Array.from([
    167, 222, 19, 114, 85, 21, 14, 118
  ]);

  if (!data.slice(0, 8).equals(Buffer.from(TARGET_DISCRIMINATOR))) {
    return null;
  }

  const offset = 8;

  const amount = Number(data.readBigUInt64LE(offset));
  const recipient = data.slice(offset + 12, offset + 44);
  const evmBytes = new PublicKey(recipient).toBuffer().slice(-20);
  const evmMintRecipient = '0x' + Buffer.from(evmBytes).toString('hex');

  return {
    token: USDC_ADDRESS,
    amount: amount.toString(),
    toAddress: evmMintRecipient,
  };
}

function readU32(buffer: Buffer, offset: number): [number, number] {
  return [buffer.readUInt32LE(offset), offset + 4];
}

function readU64(buffer: Buffer, offset: number): [bigint, number] {
  return [buffer.readBigUInt64LE(offset), offset + 8];
}

function readVecU8(buffer: Buffer, offset: number): [Uint8Array, number] {
  const [length, newOffset] = readU32(buffer, offset);
  const end = newOffset + length;
  return [buffer.slice(newOffset, end), end];
}

function readPublicKey(buffer: Buffer, offset: number): [string, number] {
  const key = new PublicKey(buffer.slice(offset, offset + 32));
  return [key.toBase58(), offset + 32];
}

function parseCcipDepositInstruction(data: Buffer): any {
  const TARGET_DISCRIMINATOR = Uint8Array.from([
    108, 216, 134, 191, 249, 234, 33, 84,
  ]);

  if (!data.slice(0, 8).equals(Buffer.from(TARGET_DISCRIMINATOR))) {
    return null;
  }

  let offset = 8;

  const [, o1] = readU64(data, offset);
  offset = o1;

  const [receiverBytes, o2] = readVecU8(data, offset);
  offset = o2;

  const [, o3] = readVecU8(data, offset);
  offset = o3;

  const [tokenAmountsLen, o4] = readU32(data, offset);
  offset = o4;

  const tokenAmounts: { token: string, amount: string }[] = [];
  for (let i = 0; i < tokenAmountsLen; i++) {
    const [token, o5] = readPublicKey(data, offset);
    const [amount, o6] = readU64(data, o5);
    offset = o6;
    tokenAmounts.push({ token, amount: amount.toString() });
  }

  const evmBytes = new PublicKey(receiverBytes).toBuffer().slice(-20);
  const evmMintRecipient = '0x' + Buffer.from(evmBytes).toString('hex');

  return {
    amount: tokenAmounts[0].amount,
    token: tokenAmounts[0].token,
    toAddress: evmMintRecipient
  };
}


function base58decode (str: string): Uint8Array {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const base = alphabet.length;
  const alphabetMap = new Map<string, number>();
  for (let i = 0; i < alphabet.length; i++) alphabetMap.set(alphabet[i], i);

  const bytes = [0];
  for (const char of str) {
    const value = alphabetMap.get(char);
    if (value === undefined) throw new Error(`Invalid base58 character "${char}"`);
    let carry = value;
    for (let j = 0; j < bytes.length; ++j) {
      carry += bytes[j] * base;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }

  let zeros = 0;
  while (str[zeros] === "1") zeros++;

  return new Uint8Array([...new Array(zeros).fill(0), ...bytes.reverse()]);
}
