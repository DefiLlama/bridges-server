import { getLatestBlock } from "../utils/blocks";
import { Chain } from "@defillama/sdk/build/general";
import adapters from "./";
import { importBridgeNetwork } from "../data/importBridgeNetwork";
import { getLlamaPrices } from "../utils/prices";
import { transformTokens } from "../helpers/tokenMappings";

const logTypes = {
  txHash: "string",
  blockNumber: "number",
  from: "string",
  to: "string",
  token: "string",
  isDeposit: "boolean",
} as { [key: string]: string };

if (process.argv.length < 4) {
  console.error(`Missing argument, you need to provide the exported name of adapter to test and how many blocks into the past to query.
        Eg: npx ts-node test polygon 250`);
  process.exit(1);
}

const adapterName = process.argv[2];
const numberOfBlocks = process.argv[3];

const testAdapter = async () => {
  const adapter = adapters[adapterName];
  if (!adapter) {
    throw new Error(`Adapter for ${adapterName} not found, check it is exported correctly.`);
  }
  const bridgeNetwork = importBridgeNetwork(adapterName);
  if (!bridgeNetwork) {
    throw new Error(`No entry for bridge found in src/data/bridgeNetworkData. Add an entry there before testing.`);
  }

  await Promise.all(
    Object.entries(adapter).map(async ([chain, adapterChainEventsFn]): Promise<void>=> {
      let uniqueTokens = {} as { [token: string]: boolean };
      let tokensForPricing = [] as any;
      const contractsChain = bridgeNetwork.chainMapping?.[chain as Chain]
        ? bridgeNetwork.chainMapping?.[chain as Chain]
        : chain;
      let block = undefined;

      try {
        block = await getLatestBlock(contractsChain, bridgeNetwork.bridgeDbName);
        if (!block) {
          throw new Error(`Unable to get latest block for ${adapterName} adapter on chain ${contractsChain}.`);
        }
      } catch(e) {
        // in case thrown internally from the bridge adapter
        console.error(`Unable to get latest block for ${adapterName} adapter on chain ${contractsChain}.`)
        return ;
      }
      
      const { number, timestamp } = block;
      if (!(number && timestamp)) {
        console.error(`Missing block number or timestamp for chain ${contractsChain}.`)
        return ;
      }
      const startBlock = number - parseInt(numberOfBlocks);
      console.log(`Getting event logs on chain ${contractsChain} from block ${startBlock} to ${number}.`);
      const eventLogs = await adapterChainEventsFn(startBlock, number);
      // console.log(eventLogs)
      console.log(`Found ${eventLogs.length} event logs on chain ${contractsChain}.`);
      for (const log of eventLogs) {
        console.log(`[${contractsChain}] ${log.isDeposit ? "Deposit" : "Withdrawal"} ${log.txHash}`);
        console.log(`From: ${log.from} To: ${log.to} `);
      }
      console.log(`${eventLogs.length} transactions found.`);
      const eventPromises = Promise.all(
        eventLogs.map(async (log: any) => {
          ["txHash", "blockNumber", "from", "to", "token", "isDeposit"].map((key) => {
            if (!(log[key] !== null && typeof log[key] === logTypes[key])) {
              console.log("Yes it is missing")
              throw new Error(
                `${key} is missing, null, or wrong type in log. It is of type ${typeof log[
                key
                ]} and should be of type ${logTypes[key]}.`
              );
            }
          });

          const { amount , isUSDVolume } = log;

          if(!isUSDVolume) {
            if(!amount._isBigNumber) {
              throw new Error(
                `Amount type ${typeof amount} and should be of type BigNumber.`
              );
            }
            const token = log.token.toLowerCase();
            const tokenKey = transformTokens[contractsChain]?.[token]
              ? transformTokens[contractsChain]?.[token]
              : `${contractsChain}:${token}`;
            uniqueTokens[tokenKey] = true;
          }
        })
      );
      await eventPromises;
      console.log(`Values for event logs have correct types on chain ${chain}.`);

      tokensForPricing = Object.keys(uniqueTokens);
      const llamaPrices = await getLlamaPrices(tokensForPricing, timestamp);
      console.log(
        `Over the past ${numberOfBlocks} blocks, ${tokensForPricing.length} unique tokens were transferred and ${Object.keys(llamaPrices).length
        } prices for them were found on ${chain}.`
      );
      for (const token of tokensForPricing) {
        if (!llamaPrices?.[token]) {
          console.log(`token ${token} is missing price.`);
        }
      }

      console.log("Done!", contractsChain);
    })
  );
  process.exit();
};

testAdapter();
