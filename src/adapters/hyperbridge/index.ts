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
  soneium: "0x7F0165140D0f3251c8f6465e94E9d12C7FD40711",
  optimism: "0x78c8A5F27C06757EA0e30bEa682f1FD5C8d7645d",
} as const;

type SupportedChains = keyof typeof ismpHostAddresses;

const intentGatewayAddresses: Partial<Record<SupportedChains, string>> = {
  ethereum: "0x1A4ee689A004B10210A1dF9f24A387Ea13359aCF",
  arbitrum: "0x1A4ee689A004B10210A1dF9f24A387Ea13359aCF",
  base: "0x1A4ee689A004B10210A1dF9f24A387Ea13359aCF",
  bsc: "0x1A4ee689A004B10210A1dF9f24A387Ea13359aCF",
  polygon: "0x1A4ee689A004B10210A1dF9f24A387Ea13359aCF",
};

// Extract ISMP module addresses from events
// Returns a map of txHash -> Set of ISMP module addresses
const extractIsmpModuleAddresses = (events: EventData[]): Map<string, Set<string>> => {
  const ismpModulesByTx = new Map<string, Set<string>>();

  for (const event of events) {
    if (!ismpModulesByTx.has(event.txHash)) {
      ismpModulesByTx.set(event.txHash, new Set<string>());
    }
    const modules = ismpModulesByTx.get(event.txHash)!;

    if (event.from) {
      modules.add(event.from.toLowerCase());
    }

    if (event.to) {
      modules.add(event.to.toLowerCase());
    }
  }

  return ismpModulesByTx;
};

// For each ISMP event and IntentGateway OrderPlaced event, scan its tx for ERC20 Transfer logs and turn those into EventData.
const extractTransfersFromIsmpEvents = async (
  events: EventData[],
  chain: Chain,
  ismpModulesByTx: Map<string, Set<string>>
): Promise<EventData[]> => {
  const provider = getProvider(chain as string) as any;
  const transfers: EventData[] = [];
  const intentGateway = intentGatewayAddresses[chain as SupportedChains];

  for (const event of events) {
    const ismpModules = ismpModulesByTx.get(event.txHash);
    // Check if this is an OrderPlaced event (has isDeposit=true but no from/to)
    const isOrderPlacedEvent = event.isDeposit;

    // Skip if this transaction has neither ISMP modules nor OrderPlaced event
    if ((!ismpModules || ismpModules.size === 0) && !isOrderPlacedEvent) continue;

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

      const fromLower = from.toLowerCase();
      const toLower = to.toLowerCase();
      const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

      // Special Case: OrderPlaced event indicates a deposit
      // Only track transfers TO the IntentGateway address for OrderPlaced transactions
      if (isOrderPlacedEvent) {
        if (!intentGateway || toLower !== intentGateway.toLowerCase()) {
          // Skip this transfer if it's an OrderPlaced tx but not to IntentGateway
          continue;
        }
        // For OrderPlaced events, mark as deposit
        transfers.push({
          txHash: event.txHash,
          blockNumber: event.blockNumber,
          from,
          to,
          token,
          amount,
          isDeposit: true,
        });
        continue;
      }

      // Handle ISMP events
      // Special Case for Token Gateway: If `from` is zero address → deposit, if `to` is zero address → withdrawal
      let isDeposit: boolean;
      if (fromLower === ZERO_ADDRESS) {
        isDeposit = true;
      } else if (toLower === ZERO_ADDRESS) {
        isDeposit = false;
      } else if (ismpModules && ismpModules.size > 0) {
        // If transfer is TO an ISMP module → deposit, FROM an ISMP module → withdrawal
        isDeposit = ismpModules.has(toLower);
      } else {
        isDeposit = false;
      }

      transfers.push({
        txHash: event.txHash,
        blockNumber: event.blockNumber,
        from,
        to,
        token,
        amount,
        isDeposit,
      });
    }
  }

  return transfers;
};

const constructParams = (chain: SupportedChains) => {
  const ismpHost = ismpHostAddresses[chain];
  const intentGateway = intentGatewayAddresses[chain];

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
      argKeys: {
        from: "from",
        to: "to",
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
      argKeys: {
        from: "from",
        to: "to",
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
      argKeys: {
        from: "from",
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

    const eventParams = [
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

    if (intentGateway) {
      const orderPlacedEventParams = {
        target: intentGateway,
        topic:
          "OrderPlaced(bytes32,bytes,bytes,uint256,uint256,uint256,(bytes32,uint256,bytes32)[],(bytes32,uint256)[],bytes)",
        abi: [
          "event OrderPlaced(bytes32 user, bytes sourceChain, bytes destChain, uint256 deadline, uint256 nonce, uint256 fees, tuple(bytes32,uint256,bytes32)[] outputs, tuple(bytes32,uint256)[] inputs, bytes callData)",
        ],
        logKeys: {
          blockNumber: "blockNumber",
          txHash: "transactionHash",
        },
        isDeposit: true,
      };
      (eventParams as any[]).push(orderPlacedEventParams);
    }

    // Fetch all events (ISMP and OrderPlaced)
    const allEvents = await getTxDataFromEVMEventLogs(
      "hyperbridge",
      chain as Chain,
      fromBlock,
      toBlock,
      eventParams as ContractEventParams[]
    );

    const ismpModulesByTx = extractIsmpModuleAddresses(allEvents);

    const transferEvents = await extractTransfersFromIsmpEvents(allEvents, chain as Chain, ismpModulesByTx);
    return transferEvents;
  };
};

const adapter: BridgeAdapter = {
  bsc: constructParams("bsc"),
  soneium: constructParams("soneium"),
  optimism: constructParams("optimism"),
  ethereum: constructParams("ethereum"),
  arbitrum: constructParams("arbitrum"),
  base: constructParams("base"),
  polygon: constructParams("polygon"),
  unichain: constructParams("unichain"),
};

export default adapter;
