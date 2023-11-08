import { BridgeAdapter, ContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

enum Chains {
  arbitrum = "arbitrum",
  wanchain = "wanchain",
  ethereum = "ethereum",
  avalanche = "avalanche",
  moonbeam = "moonbeam",
  moonriver = "moonriver",
  functionX = "functionX",
  telos = "telos",
  polygon = "polygon",
  okexchain = "okexchain",
  optimism = "optimism",
  xdc = "xdc",
  bsc = "bsc",
  astar = "astar",
  metis = "metis",
  horizen = "horizen",
  fantom = "fantom",
  clover = "clover",
  gather = "gth",
  tron = "tron",
  vinuchain = "vinu",
}

const contractAddresses = {
  [Chains.arbitrum]: {
    portal: "0xf7ba155556e2cd4dfe3fe26e506a14d2f4b97613",
  },
  [Chains.wanchain]: {
    portal: "0xe85b0d89cbc670733d6a40a9450d8788be13da47",
  },
  [Chains.ethereum]: {
    portal: "0xfceaaaeb8d564a9d0e71ef36f027b9d162bc334e",
  },
  [Chains.avalanche]: {
    portal: "0x74e121a34a66d54c33f3291f2cdf26b1cd037c3a",
  },
  [Chains.moonbeam]: {
    portal: "0x6372aec6263aa93eacedc994d38aa9117b6b95b5",
  },
  [Chains.moonriver]: {
    portal: "0xde1ae3c465354f01189150f3836c7c15a1d6671d",
  },
  [Chains.functionX]: {
    portal: "0xdf935552fac687123c642f589296762b632a9aaf",
  },
  [Chains.telos]: {
    portal: "0x201e5de97dfc46aace142b2009332c524c9d8d82",
  },
  [Chains.polygon]: {
    portal: "0x2216072a246a84f7b9ce0f1415dd239c9bf201ab",
  },
  [Chains.okexchain]: {
    portal: "0xf7ba155556e2cd4dfe3fe26e506a14d2f4b97613",
  },
  [Chains.optimism]: {
    portal: "0xc6ae1db6c66d909f7bfeeeb24f9adb8620bf9dbf",
  },
  [Chains.xdc]: {
    portal: "0xf7ba155556e2cd4dfe3fe26e506a14d2f4b97613",
  },
  [Chains.bsc]: {
    portal: "0xc3711bdbe7e3063bf6c22e7fed42f782ac82baee",
  },
  [Chains.astar]: {
    portal: "0x592de30bebff484b5a43a6e8e3ec1a814902e0b6",
  },
  [Chains.metis]: {
    portal: "0xc6ae1db6c66d909f7bfeeeb24f9adb8620bf9dbf",
  },
  [Chains.horizen]: {
    portal: "0x97e0883493e8bb7a119a1e36e53ee9e7a2d3ca7b",
  },
  [Chains.fantom]: {
    portal: "0xccffe9d337f3c1b16bd271d109e691246fd69ee3",
  },
  [Chains.clover]: {
    portal: "0xf7ba155556e2cd4dfe3fe26e506a14d2f4b97613",
  },
  [Chains.gather]: {
    portal: "0xc6ae1db6c66d909f7bfeeeb24f9adb8620bf9dbf",
  },
  [Chains.tron]: {
    portal: "0xfe464ebd5bb5d95731f90aa7b9e39df920a61c97",
  },
  [Chains.vinuchain]: {
    portal: "0x72ccf64ee5e2c7629ee4eee3e6ad6990289178ae",
  },
};

const userLockPortalEventParams: ContractEventParams = {
  target: "",
  topic: "UserLockLogger(bytes32,uint256,address,uint256,uint256, bytes)",
  abi: [
    "event UserLockLogger(bytes32 indexed smgID, uint indexed tokenPairID, address indexed tokenAccount, uint value, uint serviceFee, bytes userAccount)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    to: "userAccount",
    amount: "value",
    token: "tokenAccount",
  },
  isDeposit: true,
};

const smgReleasePortalEventParams: ContractEventParams = {
  target: "",
  topic: "SmgReleaseLogger(bytes32,bytes32,uint256,uint256,address,address)",
  abi: [
    "event SmgReleaseLogger(bytes32 indexed uniqueID, bytes32 indexed smgID, uint indexed tokenPairID, uint value, address tokenAccount, address userAccount)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    to: "userAccount",
    amount: "value",
    token: "tokenAccount",
  },
  isDeposit: false,
};

const constructParams = (chain: Chains) => {
  const { portal } = contractAddresses[chain];
  const eventParams: ContractEventParams[] = [
    {
      ...userLockPortalEventParams,
      target: portal,
      fixedEventData: {
        to: portal,
      },
    },
    {
      ...smgReleasePortalEventParams,
      target: portal,
      fixedEventData: {
        from: portal,
      },
    },
  ];
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("wanbridge", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  arbitrum: constructParams(Chains.arbitrum),
  polygon: constructParams(Chains.polygon),
  bsc: constructParams(Chains.bsc),
  ethereum: constructParams(Chains.ethereum),
  avalanche: constructParams(Chains.avalanche),
  optimism: constructParams(Chains.optimism),
  fantom: constructParams(Chains.fantom),
  moonbeam: constructParams(Chains.moonbeam),
  moonriver: constructParams(Chains.moonriver),
  telos: constructParams(Chains.telos),
  okexchain: constructParams(Chains.okexchain),
  xdc: constructParams(Chains.xdc),
  astar: constructParams(Chains.astar),
  metis: constructParams(Chains.metis),
  wan: constructParams(Chains.wanchain),

  vinuchain: constructParams(Chains.vinuchain),
  functionx: constructParams(Chains.functionX),
  eon: constructParams(Chains.horizen),
  clv: constructParams(Chains.clover),
  gather: constructParams(Chains.gather),

  // tron: constructParams(Chains.tron),
};

export default adapter;
