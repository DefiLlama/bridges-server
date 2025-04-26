import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

// TODO: Add contract addresses and event topics for Everclear
const contractAddresses = {
  // ethereum: ["0x..."],
  // polygon: ["0x..."],
} as const;

const depositParams: PartialContractEventParams = {
  // TODO: Fill in the correct event parameters
  target: "",
  topic: "",
  abi: [],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    to: "",
    from: "",
    token: "",
    amount: "",
  },
  isDeposit: true,
};

const withdrawalParams: PartialContractEventParams = {
  // TODO: Fill in the correct event parameters
  target: "",
  topic: "",
  abi: [],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    to: "",
    from: "",
    token: "",
    amount: "",
  },
  isDeposit: false,
};

const constructParams = (chain: Chain) => {
  // const chainConfig = contractAddresses[chain as keyof typeof contractAddresses];

  const eventParams: PartialContractEventParams[] = [
    // { ...depositParams, target: chainConfig.depositContract },
    // { ...withdrawalParams, target: chainConfig.withdrawalContract },
  ];

  // TODO: Implement the logic to fetch and process transaction data from Everclear
  return async (fromBlock: number, toBlock: number) => {
    console.log("Fetching Everclear bridge volume from block:", fromBlock, "to block:", toBlock)
    return getTxDataFromEVMEventLogs("everclear", chain, fromBlock, toBlock, eventParams);
  };
};

const adapter: BridgeAdapter = {
  // TODO: Add the correct chains for Everclear
  ethereum: constructParams("ethereum"),
  optimism: constructParams("optimism"),
  polygon: constructParams("polygon"),
  arbitrum: constructParams("arbitrum"),
  bsc: constructParams("bsc"),
  gnosis: constructParams("xdai"),
  linea: constructParams("linea"),
  base: constructParams("base"),
  metis: constructParams("metis"),
  mode: constructParams("mode"),
};

export default adapter;
