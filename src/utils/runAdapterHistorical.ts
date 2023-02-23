import { Chain } from "@defillama/sdk/build/general";
import { lookupBlock } from "@defillama/sdk/build/util";
import bridgeNetworkData from "../data/bridgeNetworkData";
import { wait } from "../helpers/etherscan";
import { runAdapterHistorical } from "./adapter";

async function fillAdapterHistorical(startTimestamp: number, endTimestamp: number, bridgeDbName: string) {
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
      console.log(`Running adapter for ${chain} for ${bridgeDbName}`);
      await wait(500 * i);
      const startBlock = await lookupBlock(startTimestamp, { chain: nChain as Chain });
      const endBlock = await lookupBlock(endTimestamp, { chain: nChain as Chain });
      await runAdapterHistorical(
        startBlock.block,
        endBlock.block,
        adapter.id,
        chain.toLowerCase(),
        true,
        false,
        "upsert"
      );
    })
  );
  await promises;
}

fillAdapterHistorical(1671580800, 1676419200, "stargate");
