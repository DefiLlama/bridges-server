import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const contracts = {
  ethereum: {
    portal: "0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8",
    synthesis: ZERO_ADDRESS,
  },
  bsc: {
    portal: "0x5Aa5f7f84eD0E5db0a4a85C3947eA16B53352FD4",
    synthesis: "0x6B1bbd301782FF636601fC594Cd7Bfe74871bfaA",
  },
  avax: {
    portal: "0xE75C7E85FE6ADd07077467064aD15847E6ba9877",
    synthesis: ZERO_ADDRESS,
  },
  polygon: {
    portal: "0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8",
    synthesis: ZERO_ADDRESS,
  },
  telos: {
    portal: "0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8",
    synthesis: ZERO_ADDRESS,
  },
  kava: {
    portal: "0x292fC50e4eB66C3f6514b9E402dBc25961824D62",
    synthesis: ZERO_ADDRESS,
  },
  boba: {
    portal: "0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8",
    synthesis: ZERO_ADDRESS,
  },
  boba_bnb: {
    portal: ZERO_ADDRESS,
    synthesis: "0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8",
  },
  zksync: {
    portal: "0x39dE19C9fF25693A2311AAD1dc5C790194084A39",
    synthesis: ZERO_ADDRESS,
  },
  arbitrum: {
    portal: "0x01A3c8E513B758EBB011F7AFaf6C37616c9C24d9",
    synthesis: ZERO_ADDRESS,
  },
  optimism: {
    portal: "0x292fC50e4eB66C3f6514b9E402dBc25961824D62",
    synthesis: ZERO_ADDRESS,
  },
  arbitrum_nova: {
    portal: "0x292fC50e4eB66C3f6514b9E402dBc25961824D62",
    synthesis: ZERO_ADDRESS,
  },
  polygon_zkevm: {
    portal: "0x292fC50e4eB66C3f6514b9E402dBc25961824D62",
    synthesis: ZERO_ADDRESS,
  },
} as const;

type SupportedChains = keyof typeof contracts;

const synthesizeRequestParams: PartialContractEventParams = {
  target: "",
  topic: "SynthesizeRequest(bytes32,address,uint256,address,address,uint256,address)",
  abi: [
    "event SynthesizeRequest(bytes32 id,address indexed from,uint256 indexed chainID,address indexed revertableAddress,address to,uint256 amount,address token)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "amount",
    to: "to",
    from: "from",
    token: "token",
  },
  isDeposit: true,
};

const burnRequestParams: PartialContractEventParams = {
  target: "",
  topic: "BurnRequest(bytes32,address,uint256,address,address,uint256,address)",
  abi: [
    "event BurnRequest(bytes32 id,address indexed from,uint256 indexed chainID,address indexed revertableAddress,address to,uint256 amount,address token)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "amount",
    to: "to",
    from: "from",
    token: "token",
  },
  isDeposit: false,
};

const constructParams = (chain: SupportedChains) => {
  const eventParams: PartialContractEventParams[] = [];

  if (contracts[chain].portal !== ZERO_ADDRESS) {
    eventParams.push({
      ...synthesizeRequestParams,
      target: contracts[chain].portal,
    });
  }

  if (contracts[chain].synthesis !== ZERO_ADDRESS) {
    eventParams.push({
      ...burnRequestParams,
      target: contracts[chain].synthesis,
    });
  }

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("symbiosis", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  bsc: constructParams("bsc"),
  avalanche: constructParams("avax"),
  polygon: constructParams("polygon"),
  telos: constructParams("telos"),
  kava: constructParams("kava"),
  boba: constructParams("boba"),
  // boba_bnb: constructParams("boba_bnb"),
  // zksync: constructParams("zksync"),
  arbitrum: constructParams("arbitrum"),
  optimism: constructParams("optimism"),
  arbitrum_nova: constructParams("arbitrum_nova"),
  polygon_zkevm: constructParams("polygon_zkevm"),
};

export default adapter;
