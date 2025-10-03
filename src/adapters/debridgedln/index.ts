import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { ethers } from "ethers";
import fetch from "node-fetch";
import { EventData } from "../../utils/types";
const retry = require("async-retry");

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
  sonic: "0x0000000000000000000000000000000000000000", // S 
  plume: "0x0000000000000000000000000000000000000000", // PLUME
  plasma: "0x0000000000000000000000000000000000000000", // XPL
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

const withdrawParams: PartialContractEventParams = {
  target: evmContracts.dlnDestination,
  topic:
    "FulfilledOrder((uint64,bytes,uint256,bytes,uint256,uint256,bytes,uint256,bytes,bytes,bytes,bytes,bytes,bytes),bytes32,address,address)",
  abi: [
    "event FulfilledOrder((uint64 makerOrderNonce, bytes makerSrc, uint256 giveChainId, bytes giveTokenAddress, uint256 giveAmount, uint256 takeChainId, bytes takeTokenAddress, uint256 takeAmount, bytes receiverDst, bytes givePatchAuthoritySrc, bytes orderAuthorityAddressDst, bytes allowedTakerDst, bytes allowedCancelBeneficiarySrc, bytes externalCall) order, bytes32 orderId, address sender, address unlockAuthority)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "order.takeAmount",
    token: "order.takeTokenAddress",
    to: "order.receiverDst",
    from: "order.makerSrc",
  },
  mapTokens: {},
  isDeposit: false,
};

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

type ApiSolanaEvent = {
  blockNumber: number;
  txHash: string;
  from: string;
  to: string;
  token: string;
  amount: string;
  isDeposit: boolean;
  giveAmountUSD: number;
  blockTimestamp: number;
};

const solanaBlockNumberFirstUsedByDebridge = 166833820;

const fetchSolanaEvents = async (fromBlock: number, toBlock: number): Promise<ApiSolanaEvent[]> => {
  return retry(() =>
    fetch(
      `https://stats-api.dln.trade/api/OrderEvents/solanaDepositsAndWithdrawals?fromBlock=${fromBlock}&toBlock=${toBlock}`
    ).then((res) => res.json())
  );
};

const getSolanaEvents = async (fromBlock: number, toBlock: number): Promise<EventData[]> => {
  // Performance optimization: deBridge does not have any orders from Solana prior this block
  if (toBlock < solanaBlockNumberFirstUsedByDebridge) {
    return [];
  }

  const events = await fetchSolanaEvents(fromBlock, toBlock);

  return events.map(
    (event) =>
      <EventData>{
        ...event,
        token:
          event.token === "11111111111111111111111111111111"
            ? "So11111111111111111111111111111111111111112"
            : event.token,
        amount: ethers.BigNumber.from(Math.round(event.giveAmountUSD)),
        isUSDVolume: true,
        timestamp: event.blockTimestamp * 1000,
      }
  );
};

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
  solana: getSolanaEvents,
  sonic: constructParams("sonic"),
  plasma: constructParams("plasma"),
  plume: constructParams("plume"),
};

export default adapter;
