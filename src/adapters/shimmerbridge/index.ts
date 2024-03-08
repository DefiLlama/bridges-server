import { BridgeAdapter, ContractEventParams, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

// const WRAPPED_ERC20_ON_SHIMMER_EVM: Record<string, string> = {
//   USDC: "0xeCE555d37C37D55a6341b80cF35ef3BC57401d1A",
//   USDT: "0xa4f8C7C1018b9dD3be5835bF00f335D9910aF6Bd",
//   WBTC: "0xb0119035d08CB5f467F9ed8Eae4E5f9626Aa7402",
//   ETH: "0x4638C9fb4eFFe36C49d8931BB713126063BF38f9",
//   AVAX: "0xEAf8553fD72417C994525178fC917882d5AEc725",
//   MATIC: "0xE6373A7Bb9B5a3e71D1761a6Cb4992AD8537Bf28",
//   BNB: "0x2A6F394085B8E33fbD9dcFc776BCE4ed95F1900D",
//   FTM: "0x8C96Dd1A8B1952Ce6F3a582170bb173eD591D40D",
// };

const WRAPPED_TOKEN_BRIDGE_ON_SHIMMER_EVM = "0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898";

const constructParams = () => {
  const eventParamsList = new Array();

  const depositEventParams: ContractEventParams = {
    target: WRAPPED_TOKEN_BRIDGE_ON_SHIMMER_EVM,
    topic: "WrapToken(address,address,uint16,address,uint256)",
    abi: ["event WrapToken(address localToken, address remoteToken, uint16 remoteChainId, address to, uint256 amount)"],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      from: "to",
      to: "to",
      token: "localToken",
      amount: "amount",
    },
    isDeposit: true,
  };

  const withdrawEventParams: ContractEventParams = {
    target: WRAPPED_TOKEN_BRIDGE_ON_SHIMMER_EVM,
    topic: "UnwrapToken(address,address,uint16,address,uint256)",
    abi: [
      "event UnwrapToken(address localToken, address remoteToken, uint16 remoteChainId, address to, uint256 amount)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      from: "to",
      to: "to",
      token: "localToken",
      amount: "amount",
    },
    isDeposit: false,
  };

  eventParamsList.push(depositEventParams);
  eventParamsList.push(withdrawEventParams);

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("shimmerbridge", "shimmer_evm", fromBlock, toBlock, eventParamsList);
};

// On ShimmerBridge, ShimmerEVM is the only destination chain from other EVM chains like Ethereum, Polygon and etc
const adapter: BridgeAdapter = {
  shimmer_evm: constructParams(),
};

export default adapter;
