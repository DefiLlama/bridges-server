import { Chain, getProvider } from "@defillama/sdk/build/general";
import { groupBy } from "lodash";
import { lookupBlock } from "@defillama/sdk/build/util";
import bridgeNetworkData from "../data/bridgeNetworkData";
import { wait } from "../helpers/etherscan";
import { maxBlocksToQueryByChain, nonBlocksChains } from "./constants";
import adapters from "../adapters";
import { getCurrentUnixTimestamp } from "./date";
const retry = require("async-retry");

const startTs = Number(process.argv[2]);
const endTs = Number(process.argv[3]);
const bridgeName = process.argv[4];

export const runAdapterHistorical = async (
  startBlock: number,
  endBlock: number,
  bridgeNetworkId: number,
  chain: string, // needed because different chains query over different block ranges
  throwOnFailedInsert: boolean = true
) => {
  const currentTimestamp = await getCurrentUnixTimestamp();
  const bridgeNetwork = bridgeNetworkData.filter((bridgeNetwork) => bridgeNetwork.id === bridgeNetworkId)[0];
  const { bridgeDbName } = bridgeNetwork;
  const adapter = adapters[bridgeDbName];

  if (!adapter) {
    const errString = `Adapter for ${bridgeDbName} not found, check it is exported correctly.`;

    throw new Error(errString);
  }
  const adapterChainEventsFn = adapter[chain];
  if (!adapterChainEventsFn) {
    const errString = `Chain ${chain} not found on adapter ${bridgeDbName}.`;

    throw new Error(errString);
  }
  const chainContractsAreOn = bridgeNetwork.chainMapping?.[chain as Chain]
    ? bridgeNetwork.chainMapping?.[chain as Chain]
    : chain;

  const bridgeID = bridgeDbName;
  if (!bridgeID) {
    const errString = `${bridgeDbName} on chain ${chain} is missing in config table.`;

    throw new Error(errString);
  }
  const maxBlocksToQuery = maxBlocksToQueryByChain[chainContractsAreOn]
    ? maxBlocksToQueryByChain[chainContractsAreOn]
    : maxBlocksToQueryByChain.default;
  const useChainBlocks = !nonBlocksChains.includes(chainContractsAreOn);
  let block: number = startBlock;
  console.log(`Searching for transactions for ${bridgeID} from ${startBlock} to ${block}.`);
  while (block < endBlock) {
    await wait(500);
    const endBlockForQuery = block + maxBlocksToQuery > endBlock ? endBlock : block + maxBlocksToQuery;
    try {
      const eventLogs = await retry(() => adapterChainEventsFn(block, endBlockForQuery), { retries: 3, factor: 1 });

      // console.log(eventLogs);
      if (eventLogs.length === 0) {
        console.log(`No transactions found for ${bridgeID} (${bridgeDbName}-${chain}) from ${block} to ${endBlock}.`);
        block = block + maxBlocksToQuery;
        continue;
      }
      console.log(
        `${eventLogs.length} transactions were found for ${bridgeID} (${bridgeDbName}) on ${chain} from ${block} to ${endBlockForQuery}.`
      );
      let provider = undefined as any;
      if (useChainBlocks) {
        provider = getProvider(chainContractsAreOn as Chain);
        if (!provider) {
          const errString = `Could not get provider for chain ${chainContractsAreOn}.`;

          throw new Error(errString);
        }
      }
      let txBlocks = [] as number[];
      eventLogs.map((log: any) => {
        const { blockNumber } = log;
        txBlocks.push(blockNumber);
      });
      const minBlock = Math.min(...txBlocks) ?? 0;
      const maxBlock = Math.max(...txBlocks) ?? 0;
      const blockRange = maxBlock - minBlock || 1;
      // dividing blocks into 10 buckets and giving all blocks within a bucket the same timestamp,
      // in order to reduce number of getBlock calls

      // drop sus multi transfers
      const groupedEvents = groupBy(eventLogs, (event: any) => event?.txHash);
      const filteredEvents = Object.values(groupedEvents)
        .filter((events) => events.length < 100)
        .flat();
      let storedBridgeIds = {} as { [chain: string]: string };
      for (let i = 0; i < filteredEvents?.length; i++) {
        let log = filteredEvents[i];

        const { txHash, blockNumber, from, to, token, amount, isDeposit, chainOverride, isUSDVolume, txsCountedAs } =
          log;
        const bucket = Math.floor(((blockNumber - minBlock) * 9) / blockRange);

        let amountString;
        if (!amount) {
          amountString = "0";
        } else {
          amountString = amount.toString();
        }

        if (
          from.toLowerCase() === "0x0000000000000000000000000000000000000000" ||
          to.toLowerCase() === "0x0000000000000000000000000000000000000000"
        )
          return;
      }
      console.log("finished inserting transactions");
    } catch (e: any) {
      const errString = `Adapter for ${bridgeDbName} failed to get and insert logs for chain ${chain} for blocks ${block}-${endBlockForQuery}. ${
        e && e?.message
      }`;

      if (throwOnFailedInsert) {
        throw new Error(errString + e);
      }
      console.error(errString, e);
    }
    block = block + maxBlocksToQuery;
  }
  console.log(`finished inserting all transactions for ${bridgeID}`);
};

async function fillAdapterHistorical(
  startTimestamp: number,
  endTimestamp: number,
  bridgeDbName: string,
  restrictChainTo?: string
) {
  const adapter = bridgeNetworkData.find((x) => x.bridgeDbName === bridgeDbName);
  if (!adapter) throw new Error("Invalid adapter");
  console.log(`Found ${bridgeDbName}`);
  const promises = Promise.all(
    adapter.chains.map(async (chain, i) => {
      let nChain;
      if (adapter.chainMapping && adapter.chainMapping[chain.toLowerCase()]) {
        nChain = adapter.chainMapping[chain.toLowerCase()];
      } else {
        nChain = chain.toLowerCase();
      }
      if (restrictChainTo && nChain !== restrictChainTo) return;
      console.log(`Running adapter for ${chain} for ${bridgeDbName}`);
      await wait(500 * i);
      const startBlock = await lookupBlock(startTimestamp, { chain: nChain as Chain });
      const endBlock = await lookupBlock(endTimestamp, { chain: nChain as Chain });
      await runAdapterHistorical(startBlock.block, endBlock.block, adapter.id, chain.toLowerCase(), false);
    })
  );
  await promises;
  console.log(`Finished running adapter from ${startTimestamp} to ${endTimestamp} for ${bridgeDbName}`);
}

fillAdapterHistorical(startTs, endTs, bridgeName);
