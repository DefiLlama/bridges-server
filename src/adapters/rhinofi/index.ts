import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

export const bridgesAddress = {
  ethereum: "0xbca3039a18c0d2f2f84ba8a028c67290bc045afa",
  arbitrum: "0x10417734001162Ea139e8b044DFe28DbB8B28ad0",
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
  starknet: "0x0259fec57cd26d27385cd8948d3693bbf26bed68ad54d7bdd1fdb901774ff0e8",
  sonic: "0x5e023c31e1d3dcd08a1b3e8c96f6ef8aa8fcacd1",
  zircuit: "0x5e023c31e1d3dcd08a1b3e8c96f6ef8aa8fcacd1",
  ink: "0x5e023c31e1d3dcd08a1b3e8c96f6ef8aa8fcacd1",
  ape_chain: "0x5e023c31e1d3dcd08a1b3e8c96f6ef8aa8fcacd1",
  cronos_zkevm: "0xdd6a084b563731be8ed039df29fa73bebdaaea2c",
  paradex: "0x0779de82C8724e8A30553a1250aAA7109734eb69414c9CC815526a21960E9C6C",
  ton: "EQAj3SoOk4MPzjn816Crw1b4RxW79fB_Z549tyCd9HIQV6b7",
  tron: "TT3kgJohTQJNKDUWwTxtRDMHNNWNvNG3i4",
  solana: "FCW1uBM3pZ7fQWvEL9sxTe4fNiH41bu9DWX4ErTZ6aMq",
} as const;

type SupportedChains = keyof typeof bridgesAddress;

const depositParams = (chain: SupportedChains): PartialContractEventParams => {
  const bridgeAddress = bridgesAddress[chain];

  return {
    target: bridgeAddress,
    topic: "BridgedDepositWithId(address,address,address,uint256,uint256)",
    abi: ["event BridgedDepositWithId(address sender, address origin, address token, uint256 amount, uint256 commitmentId)"],
    isDeposit: true,
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "token",
      from: "origin",
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

const withdrawalWithNativeParams = (chain: SupportedChains): PartialContractEventParams => {
  const bridgeAddress = bridgesAddress[chain];

  return {
    target: bridgeAddress,
    topic: "BridgedWithdrawalWithNative(address,address,uint256,uint256)",
    abi: ["event BridgedWithdrawalWithNative(address indexed user, address indexed token, uint256 amountToken, uint256 amountNative)"],
    isDeposit: false,
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "token",
      to: "user",
      amount: "amountToken",
    },
    fixedEventData: {
      from: bridgeAddress,
    },
  };
};

const constructParams = (chain: SupportedChains) => {
  const eventParams = [
    depositParams(chain),
    withdrawalParams(chain),
    withdrawalWithNativeParams(chain),
  ];

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("rhinofi", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  arbitrum: constructParams("arbitrum"),
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
  sonic: constructParams("sonic"),
  zircuit: constructParams("zircuit"),
  ink: constructParams("ink"),
  "ape chain": constructParams("ape_chain"),
  "cronos zkevm": constructParams("cronos_zkevm"),
  // starknet: constructParams("starknet"),
  // paradex: constructParams("paradex"),
  // ton: constructParams("ton"),
  // tron: constructParams("tron"),
  // solana: constructParams("solana"),
};

export default adapter;
