import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { BigNumber } from "ethers";
import { fetchAssets, getTokenAddress } from "../squid/utils";
import { getItsToken } from "./utils";
import { Part } from "@aws-sdk/client-s3";

const addresses = {
  ethereum: {
    its: "0xB5FB4BE02232B1bBA4dC8f81dc24C26980dE9e3C",
    gateway: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
  },
  bsc: {
    its: "0xB5FB4BE02232B1bBA4dC8f81dc24C26980dE9e3C",
    gateway: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
  },
  polygon: {
    its: "0xB5FB4BE02232B1bBA4dC8f81dc24C26980dE9e3C",
    gateway: "0x6f015F16De9fC8791b234eF68D486d2bF203FBA8",
  },
  avax: {
    its: "0xB5FB4BE02232B1bBA4dC8f81dc24C26980dE9e3C",
    gateway: "0x5029C0EFf6C34351a0CEc334542cDb22c7928f78",
  },
  fantom: {
    its: "0xB5FB4BE02232B1bBA4dC8f81dc24C26980dE9e3C",
    gateway: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
  },
  arbitrum: {
    its: "0xB5FB4BE02232B1bBA4dC8f81dc24C26980dE9e3C",
    gateway: "0xe432150cce91c13a887f7D836923d5597adD8E31",
  },
} as const;

type SupportedChains = keyof typeof addresses;

const nullAddress = "0x0000000000000000000000000000000000000000";

/*****************************/
/**** SOURCE EVENTS ****/
/*****************************/

/*
  NOTE: not all deposit txs have this event
  ex. https://axelarscan.io/transfer/0x95c3a4612ef1909a01b11747de8df19276a4a2dd238ff4ccdb6a499c45415979
*/
// deposit address transfer
// ex used: https://axelarscan.io/transfer/0xb93d5769ffd85255135a7cb5f1ab43e22db43f901019459a4c6182d927df21be
const TokenSentParams: PartialContractEventParams = {
  target: "",
  topic: "TokenSent(address,string,string,string,uint256)",
  abi: [
    "event TokenSent(address sender, string destinationChain, string destinationAddress, string symbol, uint256 amount)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    to: "destinationAddress",
    token: "symbol",
    amount: "amount",
  },
  isDeposit: true,
};

// squid express send token
// ex use: https://axelarscan.io/gmp/0xeb41ddbc6dae5d4ea4eb6cf042f3f0ed7301275a097cd96465a548d4844a830b-10
// callContractWithToken
const CallContractWithTokenParams: PartialContractEventParams = {
  target: "",
  topic: "ContractCallWithToken(address,string,string,bytes32,bytes,string,uint256)",
  abi: [
    "event ContractCallWithToken(address sender, string destinationChain, string destinationContractAddress, bytes32 payloadHash, bytes payload, string symbol, uint256 amount)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "sender",
    to: "destinationContractAddress",
    token: "symbol",
    amount: "amount",
  },
  isDeposit: true,
};

//ITS interchain transfer send
//ex used: https://axelarscan.io/gmp/0xd9ac6fa1243ad76b637b7c089eee3d96329c029372a5bdc773911bdca151a878-7
const InterchainTransferSentParams: PartialContractEventParams = {
  target: "",
  topic: "InterchainTransfer(bytes32,address,string,bytes,uint256,bytes32)",
  abi: [
    "event InterchainTransfer(bytes32 tokenId, address sourceAddress, string destinationChain, bytes destinationAddress, uint256 amount, bytes32 dataHash)",
  ],
  argKeys: {
    from: "sourceAddress",
    to: "destinationAddress",
    amount: "amount",
    token: "tokenId",
  },
  isDeposit: true,
};

/*****************************/
/**** DESTINATION EVENTS ****/
/*****************************/

/*
  NOTE: not all deposit txs have this event
  ex. https://axelarscan.io/transfer/0x2f850aa5ac3ac94edd89da03ad2eb045531576c3d777a0af2cfb7d96db1e6364
*/
// deposit address receive
// ex used: https://axelarscan.io/transfer/028D8D7A481FAEE057AAD1818B386D712A6011C617BE163081BD965833411EE1
const TokenReceivedParams: PartialContractEventParams = {
  target: "",
  topic: "ContractCallApprovedWithMint(bytes32,string,string,address,bytes32,string,uint256,bytes32,uint256)",
  abi: [
    "event ContractCallApprovedWithMint(bytes32 indexed commandId, string sourceChain, string sourceAddress, address indexed contractAddress, bytes32 indexed payloadHash, string symbol, uint256 amount, bytes32 sourceTxHash, uint256 sourceEventIndex)",
  ],
  argKeys: {
    from: "sourceAddress",
    amount: "amount",
    to: "contractAddress",
    token: "symbol",
  },
  isDeposit: false,
};

//squid express receive
//ex used: https://axelarscan.io/gmp/0xeb41ddbc6dae5d4ea4eb6cf042f3f0ed7301275a097cd96465a548d4844a830b-10
//expressExecutionWithTokenFulfilled
//NOTE: This can perhaps be removed as ContractCallApproved event indexing may lead to double counting
const ExpressExecutionWithTokenParams: PartialContractEventParams = {
  target: "",
  topic: "ExpressExecutionWithTokenFulfilled(bytes32,string,string,bytes32,string,uint256,address)",
  abi: [
    "event ExpressExecutionWithTokenFulfilled(bytes32 commandId, string sourceChain, string sourceAddress, bytes32 payloadHash, string symbol, uint256 amount, address expressExecutor)",
  ],
  argKeys: {
    from: "sourceAddress",
    amount: "amount",
    token: "symbol",
  },
  isDeposit: false,
};

//ITS interchain transfer received
//ex used: https://axelarscan.io/gmp/0xd9ac6fa1243ad76b637b7c089eee3d96329c029372a5bdc773911bdca151a878
// InterchainTransferReceived (index_topic_1 bytes32 commandId, index_topic_2 bytes32 tokenId, string sourceChain, bytes sourceAddress, index_topic_3 address destinationAddress, uint256 amount, bytes32 dataHash)
const InterchainTransferReceivedParams: PartialContractEventParams = {
  target: "",
  topic: "InterchainTransferReceived (bytes32,bytes32,string,bytes,address,uint256,bytes32)",
  abi: [
    "event InterchainTransferReceived (bytes32 commandId, bytes32 tokenId, string sourceChain, bytes sourceAddress, address destinationAddress, uint256 amount, bytes32 dataHash)",
  ],
  argKeys: {
    from: "sourceAddress",
    amount: "amount",
    to: "destinationAddress",
    token: "tokenId",
  },
  isDeposit: false,
};

const constructParams = async (chain: SupportedChains) => {
  let eventParams = [] as PartialContractEventParams[];
  const addy = addresses[chain];

  const gatewayAddy = addy.gateway;
  const itsAddy = addy.its;

  const depositV1 = constructTransferParams(gatewayAddy, true, {
    excludeFrom: [gatewayAddy, nullAddress],
    excludeTo: [nullAddress],
    includeTo: [gatewayAddy],
  });

  const withdrawV1 = constructTransferParams(gatewayAddy, false, {
    excludeFrom: [nullAddress],
    excludeTo: [nullAddress, gatewayAddy],
    includeFrom: [gatewayAddy],
  });

  const assets = await fetchAssets();

  const tokenSentEvent = {
    ...TokenSentParams,
    target: gatewayAddy,
    argGetters: {
      amount: (log: any) => BigNumber.from(log.amount),
      token: (log: any) => getTokenAddress(log.symbol, chain, assets),
    },
  };

  const callContractWithTokenEvent = {
    ...TokenReceivedParams,
    target: gatewayAddy,
    argGetters: {
      amount: (log: any) => BigNumber.from(log.amount),
      token: (log: any) => getTokenAddress(log.symbol, chain, assets),
    },
  };

  const tokenReceivedEvent = {
    ...TokenReceivedParams,
    target: gatewayAddy,
    argGetters: {
      amount: (log: any) => BigNumber.from(log.amount),
      token: (log: any) => getTokenAddress(log.symbol, chain, assets),
    },
  };

  const expressExecutedWithTokenEvent = {
    ...ExpressExecutionWithTokenParams,
    target: gatewayAddy,
    argGetters: {
      amount: (log: any) => BigNumber.from(log.amount),
      token: (log: any) => getTokenAddress(log.symbol, chain, assets),
    },
  };

  const interchainTransferSentEvent = {
    ...InterchainTransferSentParams,
    target: itsAddy,
    argGetters: {
      amount: (log: any) => BigNumber.from(log.amount),
      to: (log: any) => "0x" + log.destinationAddress,
      token: (log: any) => getItsToken("0x" + log.tokenId),
    },
  };

  const interchainTransferReceivedEvent = {
    ...InterchainTransferReceivedParams,
    target: itsAddy,
    argGetters: {
      amount: (log: any) => BigNumber.from(log.amount),
      to: (log: any) => "0x" + log.destinationAddress,
      token: (log: any) => getItsToken("0x" + log.tokenId),
    },
  };

  eventParams.push(
    depositV1,
    withdrawV1,
    tokenSentEvent,
    callContractWithTokenEvent,
    tokenReceivedEvent,
    expressExecutedWithTokenEvent,
    interchainTransferSentEvent,
    interchainTransferReceivedEvent
  );

  return async (fromBlock: number, toBlock: number) =>
    await getTxDataFromEVMEventLogs("axelar", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  polygon: await constructParams("polygon"),
  fantom: await constructParams("fantom"),
  avalanche: await constructParams("avax"),
  bsc: await constructParams("bsc"),
  ethereum: await constructParams("ethereum"),
  arbitrum: await constructParams("arbitrum"),
};

export default adapter;
