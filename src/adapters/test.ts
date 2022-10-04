import { getLatestBlock } from "@defillama/sdk/build/util";
import { Chain } from "@defillama/sdk/build/general";
import adapters from "./";
import bridgeNetworks from "../data/bridgeNetworkData";

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
    throw new Error(
      `Adapter for ${adapterName} not found, check it is exported correctly.`
    );
  }
  const bridgeNetwork = bridgeNetworks.find((obj) => obj.bridgeDbName===adapterName);
  if (!bridgeNetwork) {
    throw new Error(`No entry for bridge found in src/data/bridgeNetworkData. Add an entry there before testing.`)
  }
  Object.entries(adapter).map(async ([chain, adapterChainEventsFn]) => {
    const contractsChain = bridgeNetwork.chainMapping?.[chain as Chain]
    ? bridgeNetwork.chainMapping?.[chain as Chain]
    : chain;
    const { number, timestamp } = await getLatestBlock(contractsChain);
    if (!(number && timestamp)) {
      throw new Error(
        `Unable to get blocks for ${adapterName} adapter on chain ${contractsChain}.`
      );
    }
    const startBlock = number - parseInt(numberOfBlocks);
    console.log(
      `Getting event logs on chain ${contractsChain} from block ${startBlock} to ${number}.`
    );
    const eventLogs = await adapterChainEventsFn(startBlock, number);
    console.log(eventLogs);
    const eventPromises = Promise.all(
      eventLogs.map(async (log: any) => {
        [
          "txHash",
          "blockNumber",
          "from",
          "to",
          "token",
          "amount",
          "isDeposit",
        ].map((key) => {
          if (key === "amount") {
            const amount = log.amount;
            if (!(amount && amount._isBigNumber)) {
              throw new Error(
                `Amount is missing, null, or wrong type in log. It is of type ${typeof amount} and should be of type BigNumber.`
              );
            }
          } else if (
            !(log[key] !== null && typeof log[key] === logTypes[key])
          ) {
            throw new Error(
              `${key} is missing, null, or wrong type in log. It is of type ${typeof log[
                key
              ]} and should be of type ${logTypes[key]}.`
            );
          }
        });
      })
    );
    await eventPromises;
    console.log(`Values for event logs have correct types on chain ${chain}.`);
  });
};

testAdapter();
