import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

export const bridgesAddress = {
  arbitrum: "0x10417734001162Ea139e8b044DFe28DbB8B28ad0",
  arbitrum_nova: "0x0bca65bf4b4c8803d2f0b49353ed57caaf3d66dc",
  bsc: "0xb80a582fa430645a043bb4f6135321ee01005fef",
  polygon: "0xBA4EEE20F434bC3908A0B18DA496348657133A7E",
  optimism: "0x0bca65bf4b4c8803d2f0b49353ed57caaf3d66dc",
  base: "0x2f59e9086ec8130e21bd052065a9e6b2497bb102",
  era: "0x1fa66e2b38d0cc496ec51f81c3e05e6a6708986f",
  polygon_zkevm: "0x65a4b8a0927c7fd899aed24356bf83810f7b9a3f",
  linea: "0xcf68a2721394dcf5dcf66f6265c1819720f24528",
  manta: "0x2b4553122d960ca98075028d68735cc6b15deeb5",
  opbnb: "0x2b4553122d960ca98075028d68735cc6b15deeb5",
  scroll: "0x87627c7e586441eef9ee3c28b66662e897513f33",
  avax: "0x5e023c31e1d3dcd08a1b3e8c96f6ef8aa8fcacd1",
  mantle: "0x5e023c31e1d3dcd08a1b3e8c96f6ef8aa8fcacd1",
  mode: "0x5e023c31e1d3dcd08a1b3e8c96f6ef8aa8fcacd1",
  blast: "0x5e023c31e1d3dcd08a1b3e8c96f6ef8aa8fcacd1",
  xlayer: "0x5e023c31e1d3dcd08a1b3e8c96f6ef8aa8fcacd1",
  taiko: "0x1df2de291f909baa50c1456c87c71edf9fb199d5",
} as const;

type SupportedChains = keyof typeof bridgesAddress;

const depositParams = (chain: SupportedChains): PartialContractEventParams => {
  const bridgeAddress = bridgesAddress[chain];

  return {
    target: bridgeAddress,
    topic: "BridgedDeposit(address,address,uint256)",
    abi: ["event BridgedDeposit(address indexed user, address indexed token, uint256 amount)"],
    isDeposit: true,
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "token",
      from: "user",
      amount: "amount",
    },
    fixedEventData: {
      to: bridgeAddress,
    },
  };
};

const withdrawalParams = (chain: SupportedChains): PartialContractEventParams => {
  const bridgeAddress = bridgesAddress[chain];

  return {
    target: bridgeAddress,
    topic: "BridgedWithdrawal(address,address,uint256,string)",
    abi: ["event BridgedWithdrawal(address indexed user, address indexed token, uint256 amount, string withdrawalId)"],
    isDeposit: false,
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "token",
      to: "user",
      amount: "amount",
    },
    fixedEventData: {
      from: bridgeAddress,
    },
  };
};

const constructParams = (chain: SupportedChains) => {
  const eventParams = [depositParams(chain), withdrawalParams(chain)];

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("rhinofi", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  arbitrum: constructParams("arbitrum"),
  "arbitrum nova": constructParams("arbitrum_nova"),
  bsc: constructParams("bsc"),
  polygon: constructParams("polygon"),
  optimism: constructParams("optimism"),
  base: constructParams("base"),
  "zksync era": constructParams("era"),
  "polygon zkevm": constructParams("polygon_zkevm"),
  linea: constructParams("linea"),
  manta: constructParams("manta"),
  opbnb: constructParams("opbnb"),
  scroll: constructParams("scroll"),
  avalanche: constructParams("avax"),
  mantle: constructParams("mantle"),
  mode: constructParams("mode"),
  blast: constructParams("blast"),
  'x layer': constructParams("xlayer"),
  taiko: constructParams("taiko"),
};

export default adapter;
