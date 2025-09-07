import { EventData } from '../../utils/types';
import { getTronLogs, tronGetTimestampByBlockNumber } from '../../helpers/tron';
import { get } from 'lodash';
import { PromisePool } from '@supercharge/promise-pool';

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

export const getTxDataFromTronEventLogs = async (
  adapterName: string,
  fromBlock: number,
  toBlock: number,
  paramsArray: any,
): Promise<EventData[]> => {
  const from = await tronGetTimestampByBlockNumber(fromBlock);
  const to = await tronGetTimestampByBlockNumber(toBlock);

  let accEventData = [] as EventData[];
  const getLogsPromises = Promise.all(
    paramsArray.map(async (params: any) => {
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
        eventName,
      } = params;

      let data = {} as any;
      let logs = [] as any[];
      for (let i = 0; i < 5; i++) {
        try {
          logs = await getTronLogs(target, eventName, from, to);
          if (logs.length === 0) {
            console.info(`No logs received for ${adapterName} from ${fromBlock} to ${toBlock} with event ${eventName} (${isDeposit ? 'Deposit' : 'Withdrawal'}) for ${target}.`);
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

      const { results, errors } = await PromisePool.withConcurrency(20)
        .for(logs)
        .process(async (txLog: any, i) => {
          data[i] = data[i] || {};
          data[i]["isDeposit"] = isDeposit;
          Object.entries(logKeys!).map(([eventKey, logKey]) => {
            const value = txLog[logKey as string];
            if (typeof value !== EventKeyTypes[eventKey]) {
              throw new Error(
                `Type of ${eventKey} retrieved using ${logKey} is ${typeof value} when it must be ${
                  EventKeyTypes[eventKey]
                }.`
              );
            }
            data[i][eventKey] = value;
          });
          if (argKeys) {
            try {
              const args = txLog?.result;
              if (args === undefined || args.length === 0) {
                throw new Error(
                  `Unable to get log args for ${adapterName} with arg keys ${argKeys} tron.`
                );
              }
              Object.entries(argKeys).map(([eventKey, argKey]) => {
                // @ts-ignore
                const value = argGetters?.[eventKey]?.(args) || get(args, argKey);
                if (typeof value !== EventKeyTypes[eventKey] && !Array.isArray(value)) {
                  throw new Error(
                    `Type of ${eventKey} retrieved using ${argKey} is ${typeof value} when it must be ${
                      EventKeyTypes[eventKey]
                    }.`
                  );
                }
                data[i][eventKey] = value;
              });
            } catch (error: any) {
              console.error(
                `Unable to get log args for ${adapterName} with arg keys ${argKeys}. SKIPPING TX with hash ${txLog.transaction_id} tron
                Error: ${error?.message}
                `
              );
              return;
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
        console.error("Errors in getTxDataFromTronEventLogs", errors);
      }

      const eventData = Object.values(data) as EventData[];
      accEventData.push(...eventData);
    })
  );
  await getLogsPromises;

  return accEventData;
};
