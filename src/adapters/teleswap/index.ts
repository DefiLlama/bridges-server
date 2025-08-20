import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

interface ChainConfig {
  burnRouter: string;
  exchangeRouter: string;
  transferRouter: string;
  teleBTC: string;
}

// Configuration from index copy.ts
const CHAIN_CONFIGS: Partial<Record<string, ChainConfig>> = {
  polygon: {
    burnRouter: "0x0009876C47F6b2f0BCB41eb9729736757486c75f",
    exchangeRouter: "0xD1E9Ff33EC28f9Dd8D99E685a2B0F29dCaa095a3",
    transferRouter: "0x04367D74332137908BEF9acc0Ab00a299A823707",
    teleBTC: "0x3BF668Fe1ec79a84cA8481CEAD5dbb30d61cC685",
  },
  bsc: {
    burnRouter: "0x2787D48e0B74125597DD479978a5DE09Bb9a3C15",
    exchangeRouter: "0xcA5416364720c7324A547d39b1db496A2DCd4F0D",
    transferRouter: "0xA38aD0d52B89C20c2229E916358D2CeB45BeC5FF",
    teleBTC: "0xC58C1117DA964aEbe91fEF88f6f5703e79bdA574",
  },
  bob: {
    burnRouter: "0x754DC006F4a748f80CcaF27C0efBfF412e54160D",
    exchangeRouter: "0xd724e5709dF7DC4B4dDd14B644118774146b9492",
    transferRouter: "0x25BEf4b1Ca5985661657B3B71f29c0994C36Bbba",
    teleBTC: "0x0670bEeDC28E9bF0748cB254ABd946c87f033D9d",
  },
  bsquared: {
    burnRouter: "0x84da07E1B81e3125A66124F37bEA4897e0bB4b90",
    exchangeRouter: "0xE0166434A2ad67536B5FdAFCc9a6C1B41CC5e085",
    transferRouter: "0x9042B082A31343dFf352412136fA52157ff7fdC8",
    teleBTC: "0x05698eaD40cD0941e6E5B04cDbd56CB470Db762A",
  },
};

const constructParams = (chain: string) => {
  let eventParams = [] as PartialContractEventParams[];
  const config = CHAIN_CONFIGS[chain];

  if (!config) {
    throw new Error(`Configuration not found for chain: ${chain}`);
  }

  // NewUnwrap event from burnRouter
  const unwrapEvent: PartialContractEventParams = {
    target: config.burnRouter,
    topic: "NewUnwrap(bytes,uint8,address,address,uint256,uint256,uint256,address,uint256[3],uint256[4])",
    abi: [
      "event NewUnwrap(bytes userScript, uint8 scriptType, address lockerTargetAddress, address indexed userTargetAddress, uint256 requestIdOfLocker, uint256 indexed deadline, uint256 thirdPartyId, address inputToken, uint256[3] amounts, uint256[4] fees)",
    ],
    isDeposit: false, // This is a withdraw event
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      amount: "amounts[0]", // First amount in the amounts array
      token: "inputToken",
    },
    fixedEventData: {
      from: config.burnRouter,
      to: "0x0000000000000000000000000000000000000000", // Burn address
    },
  };

  // NewWrapAndSwap event from exchangeRouter
  const wrapAndSwapEvent: PartialContractEventParams = {
    target: config.exchangeRouter,
    topic:
      "NewWrapAndSwap(address,address,address[2],uint256[2],uint256,address,bytes32,uint256,uint256,uint256[5],uint256)",
    abi: [
      "event NewWrapAndSwap(address lockerTargetAddress, address indexed user, address[2] inputAndOutputToken, uint256[2] inputAndOutputAmount, uint256 indexed speed, address indexed teleporter, bytes32 bitcoinTxId, uint256 appId, uint256 thirdPartyId, uint256[5] fees, uint256 destinationChainId)",
    ],
    isDeposit: true, // This is a deposit event
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      amount: "inputAndOutputAmount[0]", // Input amount
      token: "inputAndOutputToken[0]", // Input token
    },
    fixedEventData: {
      from: "0x0000000000000000000000000000000000000000", // From address
      to: config.exchangeRouter,
    },
  };

  // NewWrap event from transferRouter
  const wrapEvent: PartialContractEventParams = {
    target: config.transferRouter,
    topic: "NewWrap(bytes32,bytes,address,address,address,uint256[2],uint256[4],uint256,uint256)",
    abi: [
      "event NewWrap(bytes32 bitcoinTxId, bytes indexed lockerLockingScript, address lockerTargetAddress, address indexed user, address teleporter, uint256[2] amounts, uint256[4] fees, uint256 thirdPartyId, uint256 destinationChainId)",
    ],
    isDeposit: true, // This is a deposit event
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      amount: "amounts[0]", // First amount in the amounts array
      token: config.teleBTC, // Use teleBTC address from config
    },
    fixedEventData: {
      from: "0x0000000000000000000000000000000000000000", // From address
      to: config.transferRouter,
    },
  };

  eventParams.push(unwrapEvent, wrapAndSwapEvent, wrapEvent);

  return async (fromBlock: number, toBlock: number) =>
    await getTxDataFromEVMEventLogs("teleswap", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  polygon: constructParams("polygon"),
  bsc: constructParams("bsc"),
  bob: constructParams("bob"),
  bsquared: constructParams("bsquared"),
};

export default adapter;
