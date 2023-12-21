import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

/**
 * deBridge is a messaging infrastructure. DLN is a cross-chain trading infrastructure
 * DLN Contracts: https://docs.dln.trade/the-core-protocol/trusted-smart-contracts
 * For all evm chains have same contract address
 * - deposits via CreatedOrder event
 * - withdraws via FulfilledOrder event
 * 
 */

const evmContracts = {
  dlnSource: "0xeF4fB24aD0916217251F553c0596F8Edc630EB66",
  dlnDestination: "0xe7351fd770a37282b91d153ee690b63579d6dd7f",
} as const;

const nativeTokenAddress = {
  ethereum: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
  arbitrum: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // WETH
  avax: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", // AVAX
  polygon: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270", // Matic
  fantom: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83", // FTM
  linea: "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f", // WETH
  optimism: "0x4200000000000000000000000000000000000006", // WETH
  base: "0x4200000000000000000000000000000000000006", // WETH
  bsc: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // BNB
};

type SupportedChains = keyof typeof nativeTokenAddress;

const depositPrarms: PartialContractEventParams = {
  target: evmContracts.dlnSource,
  topic:
    "CreatedOrder((uint64,bytes,uint256,bytes,uint256,uint256,bytes,uint256,bytes,bytes,bytes,bytes,bytes,bytes),bytes32,bytes,uint256,uint256,uint32,bytes)",
  abi: [
    "event CreatedOrder((uint64 makerOrderNonce, bytes makerSrc, uint256 giveChainId, bytes giveTokenAddress, uint256 giveAmount, uint256 takeChainId, bytes takeTokenAddress, uint256 takeAmount, bytes receiverDst, bytes givePatchAuthoritySrc, bytes orderAuthorityAddressDst, bytes allowedTakerDst, bytes allowedCancelBeneficiarySrc, bytes externalCall) order, bytes32 orderId, bytes affiliateFee, uint256 nativeFixFee, uint256 percentFee, uint32 referralCode, bytes metadata)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "order.giveAmount",
    to: "order.receiverDst",
    from: "order.makerSrc",
    token: "order.giveTokenAddress",
  },
  isDeposit: true,
};

// since doesn't support solana, need set withdraw = deposit
// after support solana, change to original withdraw
const withdrawParams: PartialContractEventParams = {
  target: evmContracts.dlnSource,
  topic:
    "CreatedOrder((uint64,bytes,uint256,bytes,uint256,uint256,bytes,uint256,bytes,bytes,bytes,bytes,bytes,bytes),bytes32,bytes,uint256,uint256,uint32,bytes)",
  abi: [
    "event CreatedOrder((uint64 makerOrderNonce, bytes makerSrc, uint256 giveChainId, bytes giveTokenAddress, uint256 giveAmount, uint256 takeChainId, bytes takeTokenAddress, uint256 takeAmount, bytes receiverDst, bytes givePatchAuthoritySrc, bytes orderAuthorityAddressDst, bytes allowedTakerDst, bytes allowedCancelBeneficiarySrc, bytes externalCall) order, bytes32 orderId, bytes affiliateFee, uint256 nativeFixFee, uint256 percentFee, uint32 referralCode, bytes metadata)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "order.giveAmount",
    to: "order.receiverDst",
    from: "order.makerSrc",
    token: "order.giveTokenAddress",
  },
  isDeposit: false,
};

// const withdrawParams: PartialContractEventParams = {
//   target: evmContracts.dlnDestination,
//   topic:
//     "FulfilledOrder((uint64,bytes,uint256,bytes,uint256,uint256,bytes,uint256,bytes,bytes,bytes,bytes,bytes,bytes),bytes32,address,address)",
//   abi: [
//     "event FulfilledOrder((uint64 makerOrderNonce, bytes makerSrc, uint256 giveChainId, bytes giveTokenAddress, uint256 giveAmount, uint256 takeChainId, bytes takeTokenAddress, uint256 takeAmount, bytes receiverDst, bytes givePatchAuthoritySrc, bytes orderAuthorityAddressDst, bytes allowedTakerDst, bytes allowedCancelBeneficiarySrc, bytes externalCall) order, bytes32 orderId, address sender, address unlockAuthority)",
//   ],
//   logKeys: {
//     blockNumber: "blockNumber",
//     txHash: "transactionHash",
//   },
//   argKeys: {
//     amount: "order.takeAmount",
//     token: "order.takeTokenAddress",
//     to: "order.receiverDst",
//     from: "order.makerSrc",
//   },
//   mapTokens: {},
//   isDeposit: false,
// };

const constructParams = (chain: SupportedChains) => {
  const eventParams: PartialContractEventParams[] = [];

  const token = nativeTokenAddress[chain];

  const finalDepositParams = {
    ...depositPrarms,
    mapTokens: { "0x0000000000000000000000000000000000000000": token },
  };

  const finalWithdrawParams = {
    ...withdrawParams,
    mapTokens: { "0x0000000000000000000000000000000000000000": token },
  };

  eventParams.push(finalDepositParams, finalWithdrawParams);

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("debridgedln", chain, fromBlock, toBlock, eventParams);
};

// need add solana and heco

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  bsc: constructParams("bsc"), 
  polygon: constructParams("polygon"),
  arbitrum: constructParams("arbitrum"),
  avalanche: constructParams("avax"),
  fantom: constructParams("fantom"),
  linea: constructParams("linea"),
  optimism: constructParams("optimism"), 
  base: constructParams("base"),
};

export default adapter;
