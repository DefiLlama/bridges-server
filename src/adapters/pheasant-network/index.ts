import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, ContractEventParams, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const contractAddresses = {
  // ethereum: "",
  polygon: "0x84F90083e4aA00B5FD4DAaaEEc75bdF8978EDCD2",
  optimism: "0x558F7547A472a6897126e20440453e57AC320794",
  arbitrum: "0xb9ACb5601C091B39960a6c4974b979483132B30A",
  scroll: "0x27cb8546F60fD5d7869a223F40b8036a9eBe3a4f",
  era: "0x77201FC74123Ea148C836418a08Da3322B3201D3",
  base: "0x0890f8A7b193A3eEE810DE3AdcFAd181b9ce294E",
  polygon_zkevm: "0x9F28AC2c1a2A82db54DFED6B9784a7A950EfEc08",
  linea: "0x9E7FCb2c0b8a5461BCc7078a2E37886f254B060b"
} as any;

const ethTokenAddresses = {
  // ethereum: "",
  polygon: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  optimism: "0x558F7547A472a6897126e20440453e57AC320794",
  arbitrum: "0xb9ACb5601C091B39960a6c4974b979483132B30A",
  scroll: "0x27cb8546F60fD5d7869a223F40b8036a9eBe3a4f",
  era: "0x77201FC74123Ea148C836418a08Da3322B3201D3",
  base: "0x0890f8A7b193A3eEE810DE3AdcFAd181b9ce294E",
  polygon_zkevm: "0x9F28AC2c1a2A82db54DFED6B9784a7A950EfEc08",
  linea: "0x9E7FCb2c0b8a5461BCc7078a2E37886f254B060b"
} as any;

const depositParams: PartialContractEventParams = {
  target: "",
  topic: "Accept(address,bytes32,uint256)",
  abi: [
    "event Accept(address indexed userAddress, bytes32 indexed txHash, uint256 index)",
  ],
  argKeys: {
    from: "userAddress",
    amount: "index",
  },
  isDeposit: true,
};

const withdrawalParams: ContractEventParams = {
  target: "",
  topic: "NewTrade(address,uint256)",
  abi: ["event NewTrade(address indexed userAddress, uint256 index)"],
  argKeys: {
    from: "userAddress",
  },
  inputDataExtraction: {
    inputDataABI: [
      "function newTrade(uint256 _amount,address _to,uint256 _fee,uint8 _tokenTypeIndex,uint256 _destCode)",
    ],
    inputDataFnName: "newTrade",
    inputDataKeys: {
      amount: "_amount",
    },
  },
  isDeposit: false,
};

const constructParams = (chain: Chain) => {
  let eventParams = [] as any;
  const contractAddress = contractAddresses[chain];

  // We don't use amount in deposit function as an argument and event, so we can not show deposit amount in this time.
  // const finalDepositParams = {
  //   ...depositParams,
  //   target: contractAddress,
  //   fixedEventData: {
  //     token: "0x0000000000000000000000000000000000000000",
  //     to: contractAddress,
  //     amount: 0
  //   },
  // };

  const finalWithdrawalParams = {
    ...withdrawalParams,
    target: contractAddress,
    fixedEventData: {
      token: "0x0000000000000000000000000000000000000000",
      to: contractAddress
    },
  };
  eventParams.push(finalWithdrawalParams);

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("pheasantnetwork", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  // ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  optimism: constructParams("optimism"),
  arbitrum: constructParams("arbitrum"),
  scroll: constructParams("scroll"),
  era: constructParams("era"),
  base: constructParams("base"),
  polygon_zkevm: constructParams("polygon_zkevm"),
  linea: constructParams("linea")
};

export default adapter;