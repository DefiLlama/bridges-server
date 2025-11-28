import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { Chain } from "@defillama/sdk/build/general";

const ismpHostAddresses = {
  ethereum: "0x792A6236AF69787C40cF76b69B4c8c7B28c4cA20",
  arbitrum: "0xE05AFD4Eb2ce6d65c40e1048381BD0Ef8b4B299e",
  base: "0x6FFe92e4d7a9D589549644544780e6725E84b248",
  bsc: "0x24B5d421Ec373FcA57325dd2F0C074009Af021F7",
  polygon: "0xD8d3db17C1dF65b301D45C84405CcAC1395C559a",
  unichain: "0x2A17C1c3616Bbc33FCe5aF5B965F166ba76cEDAf",
} as const;

type SupportedChains = keyof typeof ismpHostAddresses;

const constructParams = (chain: SupportedChains) => {
  const ismpHost = ismpHostAddresses[chain];

  return async (fromBlock: number, toBlock: number) => {
    const postRequestEventParams: PartialContractEventParams = {
      target: ismpHost,
      topic: "PostRequestEvent(string,string,address,bytes,uint256,uint256,bytes,uint256)",
      abi: [
        "event PostRequestEvent(string source, string dest, address indexed from, bytes to, uint256 nonce, uint256 timeoutTimestamp, bytes body, uint256 fee)",
      ],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
      getTokenFromReceipt: {
        token: true,
        amount: true,
      },
    };

    const postRequestHandledParams: PartialContractEventParams = {
      target: ismpHost,
      topic: "PostRequestHandled(bytes32,address)",
      abi: ["event PostRequestHandled(bytes32 indexed commitment, address relayer)"],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
      getTokenFromReceipt: {
        token: true,
        amount: true,
      },
    };

    const postResponseEventParams: PartialContractEventParams = {
      target: ismpHost,
      topic: "PostResponseEvent(string,string,address,bytes,uint256,uint256,bytes,bytes,uint256,uint256)",
      abi: [
        "event PostResponseEvent(string source, string dest, address indexed from, bytes to, uint256 nonce, uint256 timeoutTimestamp, bytes body, bytes response, uint256 responseTimeoutTimestamp, uint256 fee)",
      ],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
      getTokenFromReceipt: {
        token: true,
        amount: true,
      },
    };

    const postResponseHandledParams: PartialContractEventParams = {
      target: ismpHost,
      topic: "PostResponseHandled(bytes32,address)",
      abi: ["event PostResponseHandled(bytes32 indexed commitment, address relayer)"],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
      getTokenFromReceipt: {
        token: true,
        amount: true,
      },
    };

    // ========== ISMP Host Get Request Events ==========

    const getRequestEventParams: PartialContractEventParams = {
      target: ismpHost,
      topic: "GetRequestEvent(string,string,address,bytes[],uint256,uint256,uint256,bytes,uint256)",
      abi: [
        "event GetRequestEvent(string source, string dest, address indexed from, bytes[] keys, uint256 height, uint256 nonce, uint256 timeoutTimestamp, bytes context, uint256 fee)",
      ],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
      getTokenFromReceipt: {
        token: true,
        amount: true,
      },
    };

    const getRequestHandledParams: PartialContractEventParams = {
      target: ismpHost,
      topic: "GetRequestHandled(bytes32,address)",
      abi: ["event GetRequestHandled(bytes32 indexed commitment, address relayer)"],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
      getTokenFromReceipt: {
        token: true,
        amount: true,
      },
    };

    // ========== ISMP Host Timeout Events ==========

    const postRequestTimeoutHandledParams: PartialContractEventParams = {
      target: ismpHost,
      topic: "PostRequestTimeoutHandled(bytes32,string)",
      abi: ["event PostRequestTimeoutHandled(bytes32 indexed commitment, string dest)"],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
      getTokenFromReceipt: {
        token: true,
        amount: true,
      },
    };

    const postResponseTimeoutHandledParams: PartialContractEventParams = {
      target: ismpHost,
      topic: "PostResponseTimeoutHandled(bytes32,string)",
      abi: ["event PostResponseTimeoutHandled(bytes32 indexed commitment, string dest)"],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
      getTokenFromReceipt: {
        token: true,
        amount: true,
      },
    };

    const getRequestTimeoutHandledParams: PartialContractEventParams = {
      target: ismpHost,
      topic: "GetRequestTimeoutHandled(bytes32,string)",
      abi: ["event GetRequestTimeoutHandled(bytes32 indexed commitment, string dest)"],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
      getTokenFromReceipt: {
        token: true,
        amount: true,
      },
    };

    const ismpEventParams = [
      postRequestEventParams,
      postRequestHandledParams,
      postResponseEventParams,
      postResponseHandledParams,
      getRequestEventParams,
      getRequestHandledParams,
      postRequestTimeoutHandledParams,
      postResponseTimeoutHandledParams,
      getRequestTimeoutHandledParams,
    ];

    const ismpEvents = await getTxDataFromEVMEventLogs(
      "hyperbridge",
      chain as Chain,
      fromBlock,
      toBlock,
      ismpEventParams
    );

    return ismpEvents;
  };
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  arbitrum: constructParams("arbitrum"),
  base: constructParams("base"),
  bsc: constructParams("bsc"),
  polygon: constructParams("polygon"),
  unichain: constructParams("unichain"),
};

export default adapter;
