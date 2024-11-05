import type { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import type { Chain } from "@defillama/sdk/build/general";

const depositParams = (contractAddress: string): PartialContractEventParams => {
  return {
    target: contractAddress,
    topic: "TokenLocked((uint256,address,address,address,uint112,uint112,address,uint256),bytes32,uint112,uint112)",
    abi: [
      "event TokenLocked((uint256 remoteChainId, address provider, address sourceToken, address targetToken, uint112 totalFee, uint112 amount, address receiver, uint256 timestamp) params, bytes32 transferId, uint112 targetAmount, uint112 fee)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "params.sourceToken",
      amount: "params.amount",
      to: "params.receiver",
    },
    txKeys: {
      from: "from",
    },
    isDeposit: true,
  };
}

const withdrawalParams = (contractAddress: string): PartialContractEventParams => {
  return {
    target: contractAddress,
    topic: "TransferFilledExt(bytes32,(uint256,address,address,address,uint112,uint112,address,uint256))",
    abi: [
      "event TransferFilledExt(bytes32 transferId, (uint256 remoteChainId,address provider,address sourceToken, address targetToken, uint112 sourceAmount, uint112 targetAmount, address receiver, uint256 timestamp) params)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    txKeys: {
      from: "from",
      to: "to",
    },
    argKeys: {
      token: "params.targetToken",
      amount: "params.targetAmount",
      to: "params.receiver",
    },
    isDeposit: false,
  };
}

const constructParams = (chain: Chain) => {
  let contractAddress = '0xbA5D580B18b6436411562981e02c8A9aA1776D10';

  if (chain === 'blast') {
    contractAddress = '0xB180D7DcB5CC161C862aD60442FA37527546cAFC';
  }

  const eventParams: PartialContractEventParams[] = [
    depositParams(contractAddress),
    withdrawalParams(contractAddress),
  ];

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("helixbridge", chain as Chain, fromBlock, toBlock, eventParams);
}

const adapter: BridgeAdapter = {
  arbitrum: constructParams("arbitrum"),
  darwinia: constructParams("darwinia"),
  polygon: constructParams("polygon"),
  bsc: constructParams("bsc"),
  linea: constructParams("linea"),
  mantle: constructParams("mantle"),
  scroll: constructParams("scroll"),
  optimism: constructParams("optimism"),
  gnosis: constructParams("xdai"),
  blast: constructParams("blast"),
  moonbeam: constructParams("moonbeam"),
  base: constructParams("base"),
  avalanche: constructParams("avax"),
  morph: constructParams("morph"),
};

export default adapter;
