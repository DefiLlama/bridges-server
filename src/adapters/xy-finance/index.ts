import { ethers } from "ethers";
import find from 'lodash/find'
import { BridgeAdapter, ContractEventParams, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import {
  Chain,
  XYRouterContractAddress,
  YBridgeContractAddress,
  YBridgeVaultsTokenContractAddress
} from './constants'

const getYBridgeSwapRequestedEventParams = (chain: Exclude<Chain, Chain.Numbers>) => {
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
    argGetters: {
      to: (log: any) => {
        const vaultToken = log?._vaultToken
        const toVaultContract = find(YBridgeVaultsTokenContractAddress[chain], { tokenAddress: vaultToken })?.contractAddress
        return toVaultContract ?? YBridgeContractAddress[chain]
      }
    },
    isDeposit: true,
  }
}

const getYBridgeSwappedForUserEventParams = (chain: Exclude<Chain, Chain.Numbers>) => {
  const contractAddress = YBridgeContractAddress[chain]
  return {
    target: contractAddress,
    topic: 'SwappedForUser(address,address,uint256,address,uint256,address)',
    abi: [
      "event SwappedForUser(address indexed _aggregatorAdaptor, address indexed _srcToken, uint256 _srcTokenAmount, address _dstToken, uint256 _dstTokenAmountOut, address _receiver)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "_dstToken",
      amount: "_dstTokenAmountOut",
      from: "_srcToken",
      to: "_receiver",
    },
    isDeposit: false,
  }
}

export const getXYRouterRequestedEventParams = (chain: Chain) => {
  const contractAddress = XYRouterContractAddress[chain]
  return {
    target: contractAddress,
    topic: 'XYRouterRequested(uint256,address,address,uint256,address,address,uint256,uint256,bytes,((bool,address),(bool,((address,address,uint256,address),address,address,bytes)),(bool,address,address,bytes)),address)',
    abi: [
      `event XYRouterRequested(
        uint256 xyRouterRequestId,
        address indexed sender,
        address srcToken,
        uint256 amountIn,
        address indexed bridgeAddress,
        address bridgeToken,
        uint256 bridgeAmount,
        uint256 dstChainId,
        bytes bridgeAssetReceiver,
        tuple(
          tuple(bool hasTip, address tipReceiver) tipInfo,
          tuple(
            bool hasDstChainSwap,
            tuple(
              tuple(address srcToken, address dstToken, uint256 minReturnAmount, address receiver) swapRequest,
              address dexAddress,
              address approveToAddress,
              bytes dexCalldata
            ) swapAction
          ) dstChainSwapInfo,
          tuple(bool hasIM, address xApp, address refundReceiver, bytes message) imInfo
        ) dstChainAction,
        address indexed affiliate)`,
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "bridgeToken",
      amount: "bridgeAmount",
      from: "sender",
      to: "bridgeAddress",
    },
    argGetters: {
      amount: (log: any) => {
        const bridgeAddress = log.bridgeAddress?.toLowerCase()
        const yBridgeContractAddress = chain !== Chain.Numbers ? YBridgeContractAddress[chain]?.toLowerCase() : ''
        /**
         * Filter the duplicated amount:
         * If the yBridge is used, return with amount 0, since getYBridgeSwapRequestedEventParams will get the event.
         */
        if (bridgeAddress === yBridgeContractAddress) {
          return ethers.BigNumber.from(0)
        }
        return log?.bridgeAmount
      }
    },
    isDeposit: true,
  }
}

const constructParams = (chain: Chain) => {
  const eventParams: (ContractEventParams | PartialContractEventParams)[] = [getXYRouterRequestedEventParams(chain)]
  
  if (chain !== Chain.Numbers) {
    /** Deposit */
    eventParams.push(getYBridgeSwapRequestedEventParams(chain))
    /** Withdrawal */
    eventParams.push(getYBridgeSwappedForUserEventParams(chain))
  }

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("xy", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams(Chain.Ethereum),
  scroll: constructParams(Chain.Scroll),
  mantle: constructParams(Chain.Mantle),
  linea: constructParams(Chain.Linea),
  base: constructParams(Chain.Base),
  arbitrum: constructParams(Chain.Arbitrum),
  'zksync era': constructParams(Chain.ZkSync),
  bsc: constructParams(Chain.Bsc),
  polygon: constructParams(Chain.Polygon),
  klaytn: constructParams(Chain.Klaytn),
  'polygon zkevm': constructParams(Chain.PolygonZkevm),
  avalanche: constructParams(Chain.Avalanche),
  optimism: constructParams(Chain.Optimism),
  cronos: constructParams(Chain.Cronos),
  fantom: constructParams(Chain.Fantom),
  astar: constructParams(Chain.Astar),
  kcc: constructParams(Chain.Kcc),
  moonriver: constructParams(Chain.Moonriver),
  thundercore: constructParams(Chain.ThunderCore),
  wemix: constructParams(Chain.Wemix),
  blast: constructParams(Chain.Blast),
  'x layer': constructParams(Chain.XLayer),
};

export default adapter;
