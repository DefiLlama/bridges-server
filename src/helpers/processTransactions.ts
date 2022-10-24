import { getLogs } from "@defillama/sdk/build/util";
import { ethers } from "ethers";
import { Chain } from "@defillama/sdk/build/general";
import { ContractEventParams, PartialContractEventParams } from "../helpers/bridgeAdapter.type";
import { EventData } from "../utils/types";
import { getProvider } from "@defillama/sdk/build/general";
import BigNumber from "bignumber.js";

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
      // if this is ever used, need to also overwrite fromBlock and toBlock
      const overriddenChain = params.chain ? params.chain : chainContractsAreOn;
      if (params.isTransfer) {
        if (!params.target) {
          throw new Error(
            `${adapterName} adapter records Transfer events but no ${params.target} is given for them in adapter.`
          );
        }
        // can make following function include a chain parameter if needed
        let topic, logKeys, argKeys, abi, topics, target;
        ({ topic, logKeys, argKeys, abi, topics, target } = setTransferEventParams(params.isDeposit, params.target));
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
      if (!params.logKeys) {
        params.logKeys = params.isDeposit
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
      if (!(params.topic && params.abi)) {
        throw new Error(
          `adapter ${adapterName} with target ${params.target} either is missing param(s) or isTransfer param is false.`
        );
      }

      const iface = new ethers.utils.Interface(params.abi);
      let data = {} as any;
      let logs = [] as any[];
      for (let i = 0; i < 5; i++) {
        try {
          logs = (
            await getLogs({
              target: params.target,
              topic: params.topic,
              keys: [],
              fromBlock: fromBlock,
              toBlock: toBlock,
              topics: params.topics,
              chain: overriddenChain,
            })
          ).output;
          //console.log(logs)
          if (logs.length === 0) {
            console.info(
              `No logs received for ${adapterName} from ${fromBlock} to ${toBlock} with topic ${params.topic}.`
            );
          }
          break;
        } catch (e) {
          if (i >= 4) {
            console.error(params.target, e);
          } else {
            continue;
          }
        }
      }

      let dataKeysToFilter = [] as number[];
      const provider = getProvider(overriddenChain) as any;
      const logPromises = Promise.all(
        logs.map(async (txLog: any, i) => {
          data[i] = data[i] || {};
          data[i]["isDeposit"] = params.isDeposit;
          Object.entries(params.logKeys!).map(([eventKey, logKey]) => {
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
          const parsedLog = iface.parseLog({
            topics: txLog.topics,
            data: txLog.data,
          });
          //console.log(parsedLog)
          if (params.argKeys) {
            const args = parsedLog?.args;
            if (args === undefined || args.length === 0) {
              throw new Error(`Unable to get log args for ${adapterName} with arg keys ${params.argKeys}.`);
            }
            Object.entries(params.argKeys).map(([eventKey, argKey]) => {
              const value = args[argKey];
              if (typeof value !== EventKeyTypes[eventKey] && !Array.isArray(value)) {
                throw new Error(
                  `Type of ${eventKey} retrieved using ${argKey} is ${typeof value} when it must be ${
                    EventKeyTypes[eventKey]
                  }.`
                );
              }
              data[i][eventKey] = value;
            });
            if (params.filter?.includeArg) {
              let toFilter = true;
              const includeArgArray = params.filter.includeArg;
              includeArgArray.map((argMappingToInclude) => {
                const argKeyToInclude = Object.keys(argMappingToInclude)[0];
                const argValueToInclude = Object.values(argMappingToInclude)[0];
                if (args[argKeyToInclude] === argValueToInclude) {
                  toFilter = false;
                }
              });
              if (toFilter) dataKeysToFilter.push(i);
            }
          }
          if (params.txKeys) {
            const tx = await provider.getTransaction(txLog.transactionHash);
            if (!tx) {
              console.error(`WARNING: Unable to get transaction data for ${adapterName}, SKIPPING tx.`);
              dataKeysToFilter.push(i);
            } else {
              Object.entries(params.txKeys).map(([eventKey, logKey]) => {
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
          if (params.inputDataExtraction) {
            const tx = await provider.getTransaction(txLog.transactionHash);
            try {
              let inputData = [] as any;
              if (params.inputDataExtraction.useDefaultAbiEncoder) {
                inputData = ethers.utils.defaultAbiCoder.decode(
                  params.inputDataExtraction.inputDataABI,
                  ethers.utils.hexDataSlice(tx.data, 4)
                );
              } else {
                const iface = new ethers.utils.Interface(params.inputDataExtraction.inputDataABI);
                inputData = iface.decodeFunctionData(params.inputDataExtraction.inputDataFnName || "", tx.data);
              }
              Object.entries(params.inputDataExtraction.inputDataKeys).map(([eventKey, inputDataKey]) => {
                let value = "" as any;
                if (params.inputDataExtraction?.useDefaultAbiEncoder) {
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
              console.error(`Unable to extract Input Data. Check this transaction: ${JSON.stringify(txLog)}`);
              dataKeysToFilter.push(i);
            }
          }
          if (params.selectIndexesFromArrays) {
            Object.entries(params.selectIndexesFromArrays).map(([eventKey, value]) => {
              if (!Array.isArray(data[i][eventKey])) {
                throw new Error(
                  `${eventKey} is not an array, but it has been specified as being one in 'selectIndexesFromArrays' in adapter.`
                );
              }
              const extractedValue = data[i][eventKey][parseInt(value)];
              data[i][eventKey] = extractedValue;
            });
          }
          if (params.mapTokens) {
            const map = params.mapTokens;
            const token = data[i].token;
            if (token && map[token]) {
              data[i].token = map[token];
            }
          }
          if (params.fixedEventData) {
            Object.entries(params.fixedEventData).map(([eventKey, value]) => {
              if (typeof value !== EventKeyTypes[eventKey]) {
                throw new Error(
                  `Type of ${eventKey} in fixedEventData is ${typeof value} when it must be ${EventKeyTypes[eventKey]}.`
                );
              }
              data[i][eventKey] = value;
            });
          }
        })
      );
      await logPromises;

      dataKeysToFilter.map((key) => {
        delete data[key];
      });

      const eventData = Object.values(data) as EventData[];

      const filteredData = eventData.filter((log) => {
        let toFilter = false;
        toFilter =
          toFilter ||
          (params.filter?.excludeFrom?.includes(log.from) ?? false) ||
          (params.filter?.excludeTo?.includes(log.to) ?? false) ||
          (params.filter?.excludeToken?.includes(log.token) ?? false);
        toFilter =
          toFilter ||
          !(params.filter?.includeFrom?.includes(log.from) ?? true) ||
          !(params.filter?.includeTo?.includes(log.to) ?? true) ||
          !(params.filter?.includeToken?.includes(log.token) ?? true);
        return !toFilter;
      });
      accEventData = [...accEventData, ...filteredData];
    })
  );
  await getLogsPromises;
  return accEventData;
};

export const getTxDataFromHashAndToken = async (
  adapterName: string,
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
          console.error(`WARNING: Unable to get transaction data for ${adapterName}, SKIPPING tx.`);
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
          amount: ethersBnAmount as BigNumber,
          isDeposit: isDeposit,
        } as EventData;
      })
    )
  ).filter((tx) => tx) as EventData[];
  return transactions;
};

export const getNativeTokenTransfersFromHash = async (
  chain: Chain,
  hashes: string[],
  address: string,
  nativeToken: string,
) => {const provider = getProvider(chain) as any
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
        const isDeposit = address === to
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
