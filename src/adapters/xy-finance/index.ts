import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { Chain, YBridgeContractAddress } from './constants'

const getYBridgeSwapRequestedEventParams = (chain: Chain) => {
  const contractAddress = YBridgeContractAddress[chain]
  return {
    target: contractAddress,
    topic: 'SwapRequested(uint256,address,(uint32,address,uint256,uint32),address,address,uint256,address,uint256,uint256,address)',
    abi: [
      "event SwapRequested(uint256 _swapId, address indexed _aggregatorAdaptor, tuple(uint32 dstChainId, address dstChainToken, uint256 expectedDstChainTokenAmount, uint32 slippage) _dstChainDesc, address _srcToken, address indexed _vaultToken, uint256 _vaultTokenAmount, address _receiver, uint256 _srcTokenAmount, uint256 _expressFeeAmount, address indexed _referrer)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "_vaultToken",
      amount: "_vaultTokenAmount",
      from: "_receiver",
      to: "_referrer",
    },
    isDeposit: false,
  }
}

const constructParams = (chain: Chain) => {
  const eventParams = [
    getYBridgeSwapRequestedEventParams(chain)
  ]

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("xy", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
    ethereum: constructParams(Chain.Ethereum),
    // arbitrum: constructParams("arbitrum"),
    // bsc: constructParams("bsc"),
    // "zksync era": constructParams("era"),
    // base: constructParams("base"),
    // scroll: constructParams("scroll"),
    // linea: constructParams("linea"),
    // polygon: constructParams("polygon"),
    // "polygon zkevm": constructParams("polygon_zkevm"),
    // optimism: constructParams("optimism"),
    // opbnb: constructParams("opbnb"),
    // avalanche: constructParams("avax"),
    // eon: constructParams("eon"),
    // fantom: constructParams("fantom"),
};

export default adapter;
