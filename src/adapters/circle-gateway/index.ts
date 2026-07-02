import { Chain } from "@defillama/sdk/build/general";
import { getLogs } from "@defillama/sdk/build/util/logs";
import { ethers } from "ethers";
import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import { incrementGetLogsCount } from "../../utils/cache";
import { EventData } from "../../utils/types";

const GATEWAY_WALLET = "0x77777777Dcc4d5A8B6E418Fd04D8997ef11000eE";
const GATEWAY_MINTER = "0x2222222d7164433c4C09B0b0D809a9b52C04C205";

const GATEWAY_BURNED_EVENT_ABI =
  "event GatewayBurned(address indexed token, address indexed depositor, bytes32 indexed transferSpecHash, uint32 destinationDomain, bytes32 destinationRecipient, address signer, uint256 value, uint256 fee, uint256 fromAvailable, uint256 fromWithdrawing)";

const ATTESTATION_USED_EVENT_ABI =
  "event AttestationUsed(address indexed token, address indexed recipient, bytes32 indexed transferSpecHash, uint32 sourceDomain, bytes32 sourceDepositor, bytes32 sourceSigner, uint256 value)";

type ChainCfg = {
  chain: Chain;
  domain: number;
};

const chainConfig: Record<string, ChainCfg> = {
  ethereum: { chain: "ethereum", domain: 0 },
  avalanche: { chain: "avax", domain: 1 },
  optimism: { chain: "optimism", domain: 2 },
  arbitrum: { chain: "arbitrum", domain: 3 },
  base: { chain: "base", domain: 6 },
  polygon: { chain: "polygon", domain: 7 },
  unichain: { chain: "unichain", domain: 10 },
  sonic: { chain: "sonic", domain: 13 },
  wc: { chain: "wc", domain: 14 },
  sei: { chain: "sei", domain: 16 },
  hyperliquid: { chain: "hyperliquid", domain: 19 },
};

const supportedDomains = new Set(Object.values(chainConfig).map(({ domain }) => domain));
const burnedIface = new ethers.utils.Interface([GATEWAY_BURNED_EVENT_ABI]);
const attestationIface = new ethers.utils.Interface([ATTESTATION_USED_EVENT_ABI]);

function flattenLogs(logs: any): any[] {
  return Array.isArray(logs?.[0]) ? (logs as any[][]).flat() : (logs as any[]);
}

function getDomain(value: unknown): number {
  return Number(ethers.BigNumber.from(value).toString());
}

function bytes32ToAddress(value: string): string {
  return ethers.utils.getAddress(ethers.utils.hexDataSlice(value, 12));
}

function collapseBatches(events: EventData[]): EventData[] {
  const merged = new Map<string, EventData>();
  for (const event of events) {
    const key = `${event.txHash}|${event.isDeposit}|${event.from}|${event.to}|${event.token}`;
    const existing = merged.get(key);
    if (existing) {
      existing.amount = existing.amount.add(event.amount);
      existing.txsCountedAs = (existing.txsCountedAs ?? 1) + (event.txsCountedAs ?? 1);
    } else {
      merged.set(key, { ...event });
    }
  }
  return [...merged.values()];
}

const constructParams = (adapterChain: keyof typeof chainConfig) => {
  const cfg = chainConfig[adapterChain];
  if (!cfg) throw new Error(`circle-gateway: unknown chain key "${adapterChain}"`);

  return async (fromBlock: number, toBlock: number): Promise<EventData[]> => {
    const out: EventData[] = [];

    incrementGetLogsCount("circle-gateway", cfg.chain);
    const burnLogs = await getLogs({
      target: GATEWAY_WALLET,
      eventAbi: GATEWAY_BURNED_EVENT_ABI,
      fromBlock,
      toBlock,
      chain: cfg.chain,
      entireLog: true,
    });

    for (const txLog of flattenLogs(burnLogs)) {
      const parsed = burnedIface.parseLog({ topics: txLog.topics, data: txLog.data });
      const destinationDomain = getDomain(parsed.args.destinationDomain);
      if (!supportedDomains.has(destinationDomain) || destinationDomain === cfg.domain) continue;

      out.push({
        blockNumber: Number(txLog.blockNumber),
        txHash: txLog.transactionHash,
        from: parsed.args.depositor,
        to: bytes32ToAddress(parsed.args.destinationRecipient),
        token: parsed.args.token,
        amount: ethers.BigNumber.from(parsed.args.value),
        isDeposit: true,
      });
    }

    incrementGetLogsCount("circle-gateway", cfg.chain);
    const attestationLogs = await getLogs({
      target: GATEWAY_MINTER,
      eventAbi: ATTESTATION_USED_EVENT_ABI,
      fromBlock,
      toBlock,
      chain: cfg.chain,
      entireLog: true,
    });

    for (const txLog of flattenLogs(attestationLogs)) {
      const parsed = attestationIface.parseLog({ topics: txLog.topics, data: txLog.data });
      const sourceDomain = getDomain(parsed.args.sourceDomain);
      if (!supportedDomains.has(sourceDomain) || sourceDomain === cfg.domain) continue;

      out.push({
        blockNumber: Number(txLog.blockNumber),
        txHash: txLog.transactionHash,
        from: bytes32ToAddress(parsed.args.sourceDepositor),
        to: parsed.args.recipient,
        token: parsed.args.token,
        amount: ethers.BigNumber.from(parsed.args.value),
        isDeposit: false,
      });
    }

    return collapseBatches(out);
  };
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  avalanche: constructParams("avalanche"),
  optimism: constructParams("optimism"),
  arbitrum: constructParams("arbitrum"),
  base: constructParams("base"),
  polygon: constructParams("polygon"),
  unichain: constructParams("unichain"),
  sonic: constructParams("sonic"),
  wc: constructParams("wc"),
  sei: constructParams("sei"),
  hyperliquid: constructParams("hyperliquid"),
};

export default adapter;
