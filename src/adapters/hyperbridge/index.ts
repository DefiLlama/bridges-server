import { BridgeAdapter, ContractEventParams, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { Chain } from "@defillama/sdk/build/general";
import { EventData } from "../../utils/types";
import { getProvider } from "../../utils/provider";
import { ethers } from "ethers";

const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const ismpHostAddresses = {
  ethereum: "0x792A6236AF69787C40cF76b69B4c8c7B28c4cA20",
  arbitrum: "0xE05AFD4Eb2ce6d65c40e1048381BD0Ef8b4B299e",
  base: "0x6FFe92e4d7a9D589549644544780e6725E84b248",
  bsc: "0x24B5d421Ec373FcA57325dd2F0C074009Af021F7",
  polygon: "0xD8d3db17C1dF65b301D45C84405CcAC1395C559a",
  unichain: "0x2A17C1c3616Bbc33FCe5aF5B965F166ba76cEDAf",
} as const;

type SupportedChains = keyof typeof ismpHostAddresses;

// For each ISMP event, scan its tx for ERC20 Transfer logs and turn those into EventData.
const extractTransfersFromIsmpEvents = async (events: EventData[], chain: Chain): Promise<EventData[]> => {
  const provider = getProvider(chain as string) as any;
  const transfers: EventData[] = [];

  for (const event of events) {
    let txReceipt: any;
    try {
      txReceipt = await provider.getTransactionReceipt(event.txHash);
    } catch (e) {
      console.error(`Error fetching tx receipt for hyperbridge tx ${event.txHash} on ${chain}:`, e);
      continue;
    }

    if (!txReceipt?.logs) continue;

    for (const log of txReceipt.logs) {
      if (!log.topics || log.topics.length < 3) continue;
      if (log.topics[0] !== TRANSFER_TOPIC) continue;

      const from = "0x" + log.topics[1].slice(26);
      const to = "0x" + log.topics[2].slice(26);
      const token = log.address;
      const amount = ethers.BigNumber.from(log.data);

      transfers.push({
        txHash: event.txHash,
        blockNumber: event.blockNumber,
        from,
        to,
        token,
        amount,
      });
    }
  }

  return transfers;
};

const constructParams = (chain: SupportedChains) => {
  const ismpHost = ismpHostAddresses[chain];

  return async (fromBlock: number, toBlock: number) => {
    const postRequestEventParams = {
      target: ismpHost,
      topic: "PostRequestEvent(string,string,address,bytes,uint256,uint256,bytes,uint256)",
      abi: [
        "event PostRequestEvent(string source, string dest, address indexed from, bytes to, uint256 nonce, uint256 timeoutTimestamp, bytes body, uint256 fee)",
      ],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
    };

    const postRequestHandledParams = {
      target: ismpHost,
      topic: "PostRequestHandled(bytes32,address)",
      abi: ["event PostRequestHandled(bytes32 indexed commitment, address relayer)"],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
    };

    const postResponseEventParams = {
      target: ismpHost,
      topic: "PostResponseEvent(string,string,address,bytes,uint256,uint256,bytes,bytes,uint256,uint256)",
      abi: [
        "event PostResponseEvent(string source, string dest, address indexed from, bytes to, uint256 nonce, uint256 timeoutTimestamp, bytes body, bytes response, uint256 responseTimeoutTimestamp, uint256 fee)",
      ],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
    };

    const postResponseHandledParams = {
      target: ismpHost,
      topic: "PostResponseHandled(bytes32,address)",
      abi: ["event PostResponseHandled(bytes32 indexed commitment, address relayer)"],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
    };

    // ========== ISMP Host Get Request Events ==========

    const getRequestEventParams = {
      target: ismpHost,
      topic: "GetRequestEvent(string,string,address,bytes[],uint256,uint256,uint256,bytes,uint256)",
      abi: [
        "event GetRequestEvent(string source, string dest, address indexed from, bytes[] keys, uint256 height, uint256 nonce, uint256 timeoutTimestamp, bytes context, uint256 fee)",
      ],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
    };

    const getRequestHandledParams = {
      target: ismpHost,
      topic: "GetRequestHandled(bytes32,address)",
      abi: ["event GetRequestHandled(bytes32 indexed commitment, address relayer)"],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
    };

    // ========== ISMP Host Timeout Events ==========

    const postRequestTimeoutHandledParams = {
      target: ismpHost,
      topic: "PostRequestTimeoutHandled(bytes32,string)",
      abi: ["event PostRequestTimeoutHandled(bytes32 indexed commitment, string dest)"],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
    };

    const postResponseTimeoutHandledParams = {
      target: ismpHost,
      topic: "PostResponseTimeoutHandled(bytes32,string)",
      abi: ["event PostResponseTimeoutHandled(bytes32 indexed commitment, string dest)"],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
    };

    const getRequestTimeoutHandledParams = {
      target: ismpHost,
      topic: "GetRequestTimeoutHandled(bytes32,string)",
      abi: ["event GetRequestTimeoutHandled(bytes32 indexed commitment, string dest)"],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
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
      ismpEventParams as ContractEventParams[]
    );

    const transferEvents = await extractTransfersFromIsmpEvents(ismpEvents, chain as Chain);
    return transferEvents;
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
