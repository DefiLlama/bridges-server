import { getLogs } from "@defillama/sdk/build/util";
import { ethers } from "ethers";
import { Chain } from "@defillama/sdk/build/general";
import { get } from "lodash";
import { ContractEventParams, PartialContractEventParams } from "../helpers/bridgeAdapter.type";
import { EventData } from "../utils/types";
import { getProvider } from "@defillama/sdk/build/general";
import { PromisePool } from "@supercharge/promise-pool";

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

interface EventLog {
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;
  removed: boolean;
  address: string;
}

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

export const getTxDataFromEVMEventLogs = async (
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
          //console.log(logs)
          if (logs.length === 0) {
            console.info(`No logs received for ${adapterName} from ${fromBlock} to ${toBlock} with topic ${topic}.`);
          }
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
                  if (args[argKeyToInclude] === argValueToInclude) {
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
                  if (args[argKeyToExclude] === argValueToExclude) {
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
                console.info(`Tx did not have input data matching given filter for ${adapterName}, SKIPPING tx.`);
                dataKeysToFilter.push(i);
                return;
              }
              if (
                functionSignatureFilter.excludeSignatures &&
                functionSignatureFilter.excludeSignatures.includes(signature)
              ) {
                console.info(`Tx did not have input data matching given filter for ${adapterName}, SKIPPING tx.`);
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

export const getTxDataFromHashAndToken = async (
  chain: Chain,
  hashData: { hash: string; token: string; isDeposit: boolean }[]
) => {
  const provider = getProvider(chain) as any;
  const transactions = (
    await Promise.all(
      hashData.map(async (data) => {
        const { hash, token, isDeposit } = data;
        // TODO: add timeout
        const tx = await provider.getTransaction(hash);
        const logs = (await provider.getTransactionReceipt(hash)).logs;
        if (!tx || !logs) {
          console.error(`WARNING: Unable to get transaction data on chain ${chain}, SKIPPING tx.`);
          return;
        }
        const { blockNumber, from, to } = tx;
        let totalAmount = ethers.BigNumber.from(0);
        logs
          .filter((log: any) => log.address === token)
          .map((log: any) => {
            const { data } = log;
            totalAmount = totalAmount.add(data);
          });
        const ethersBnAmount = totalAmount as unknown;
        return {
          blockNumber: blockNumber,
          txHash: hash,
          from: from,
          to: to,
          token: token,
          amount: ethersBnAmount,
          isDeposit: isDeposit,
        } as EventData;
      })
    )
  ).filter((tx) => tx) as EventData[];
  return transactions;
};

// note this only works if ETH is transferred directly to/from the contract, use with caution if WETH is involved
export const getNativeTokenTransfersFromHash = async (
  chain: Chain,
  hashes: string[],
  address: string,
  nativeToken: string
) => {
  const provider = getProvider(chain) as any;
  const transactions = (
    await Promise.all(
      hashes.map(async (hash) => {
        // TODO: add timeout
        const tx = await provider.getTransaction(hash);
        if (!tx) {
          console.error(`WARNING: Unable to get transaction data on chain ${chain}, SKIPPING tx.`);
          return;
        }
        const { blockNumber, from, to, value } = tx;
        if (!(address === from || address === to)) {
          console.error(`WARNING: Address given for native transfer on chain ${chain} not present in tx, SKIPPING tx.`);
          return;
        }
        const isDeposit = address === to;
        return {
          blockNumber: blockNumber,
          txHash: hash,
          from: from,
          to: to,
          token: nativeToken,
          amount: value,
          isDeposit: isDeposit,
        } as EventData;
      })
    )
  ).filter((tx) => tx) as EventData[];
  return transactions;
};

export const makeTxHashesUnique = (eventData: EventData[]) => {
  let hashCounts = {} as { [hash: string]: number };
  return eventData.map((event) => {
    const hash = event.txHash;
    const hashCount = hashCounts[hash] ?? 0;
    if (hashCount > 0) {
      hashCounts[hash] = (hashCounts[hash] ?? 0) + 1;
      const newHash = `${hash}#duplicate${hashCount}`;
      return { ...event, txHash: newHash };
    }
    hashCounts[hash] = (hashCounts[hash] ?? 0) + 1;
    return event;
  });
};
