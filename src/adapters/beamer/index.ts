import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
const nullAddress = "0x0000000000000000000000000000000000000000";

const contractAddresses = {
  ethereum: {
    requestManager: "0x7faEa6562a6cE991149F0167baF283E9aAc7Dc50",
    fillManager: "0xD5EF34B499b6d64817CC70C3b0B8D9f807F06C29",
  },
  arbitrum: {
    requestManager: "0x13bAF73f48FCF6A8aAb8431CA3A38c624cdfd8F3",
    fillManager: "0x27f72B9745CDE0fbAFe0A0d1119D75f4082bFc47",
  },
  optimism: {
    requestManager: "0x124198789EF8d82050E620De2b73332C3c6C2eD4",
    fillManager: "0x889aa3c5b5298d70613373F25Ef66Fede25B4de1",
  },
} as {
  [chain: string]: {
    requestManager: string;
    fillManager: string;
  };
};

const constructParams = (chain: string) => {
  let eventParams = [] as PartialContractEventParams[];
  const requestManager = contractAddresses[chain].requestManager;
  const fillManager = contractAddresses[chain].fillManager;

  const deposit: PartialContractEventParams = {
    target: requestManager,
    topic: "RequestCreated(bytes32,uint256,address,address,address,address,uint256,uint96,uint32,uint256,uint256)",
    abi: [
      "event RequestCreated(bytes32 indexed requestId,uint256 targetChainId,address sourceTokenAddress,address targetTokenAddress,address indexed sourceAddress,address targetAddress,uint256 amount,uint96 nonce,uint32 validUntil,uint256 lpFee,uint256 protocolFee)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      amount: "amount",
      token: "sourceTokenAddress",
      from: "targetAddress",
    },
    fixedEventData: {
      to: requestManager,
    },
    isDeposit: true,
  };

  const withdraw: PartialContractEventParams = {
    target: fillManager,
    topic: "RequestFilled(bytes32,bytes32,uint256,address,address,uint256)",
    abi: [
      "event RequestFilled(bytes32 indexed requestId,bytes32 fillId,uint256 indexed sourceChainId,address indexed targetTokenAddress,address filler,uint256 amount)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      amount: "amount",
      token: "targetTokenAddress",
      from: "filler",
    },
    fixedEventData: {
        to: nullAddress
    },
    isDeposit: false,
  };

  eventParams.push(deposit, withdraw);
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("beamer", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  arbitrum: constructParams("arbitrum"),
  optimism: constructParams("optimism"),
};

export default adapter;
