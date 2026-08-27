import { Chain } from "@defillama/sdk/build/general";
import { getLogs } from "@defillama/sdk/build/util/logs";
import { PromisePool } from "@supercharge/promise-pool";
import { ethers } from "ethers";
import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import { incrementGetLogsCount } from "../../utils/cache";
import { getProvider } from "../../utils/provider";
import { EventData } from "../../utils/types";

// Same addresses on every chain (CREATE2). https://docs.hyperbridge.network/developers/evm/contract-addresses/mainnet
const ISMP_HOST = "0x620128E2B19193d6Bd244a3AC8D3bBa0541B19c3";
const HANDLER = "0x2a18AB35DEa43474882E05A661e2F20fe89c0535";
const INTENT_GATEWAY = "0xAe041F7B0CB581876832830baeB6a2Aa2a3C9716";

const chains = ["ethereum", "arbitrum", "optimism", "base", "bsc", "polygon"];

const ZERO = "0x0000000000000000000000000000000000000000";
const TRANSFER_TOPIC = ethers.utils.id("Transfer(address,address,uint256)");
const TOKEN_INFO = "tuple(bytes32 token, uint256 amount)[]";

const ISMP_OUTGOING_ABIS = [
  "event PostRequestEvent(string source, string dest, address indexed from, bytes to, uint256 nonce, uint256 timeoutTimestamp, bytes body, uint256 fee)",
  "event GetRequestEvent(string source, string dest, bytes from, bytes[] keys, uint256 height, uint256 nonce, uint256 timeoutTimestamp, bytes context, uint256 fee)",
];
const ISMP_INCOMING_ABIS = [
  "event PostRequestHandled(bytes32 indexed commitment, address relayer)",
  "event GetRequestHandled(bytes32 indexed commitment, address relayer)",
  "event PostRequestTimeoutHandled(bytes32 indexed commitment, string dest)",
  "event GetRequestTimeoutHandled(bytes32 indexed commitment, string dest)",
];

const ORDER_PLACED_ABI = `event OrderPlaced(bytes32 user, string source, string destination, uint256 deadline, uint256 nonce, uint256 fees, address session, bytes32 beneficiary, ${TOKEN_INFO} predispatch, ${TOKEN_INFO} inputs, ${TOKEN_INFO} outputs, bytes predispatchCall, bytes outputCall, bytes32 graffiti)`;
// Emitted by the same proxy before the 2026-08-08 implementation upgrade.
const ORDER_PLACED_LEGACY_ABI = `event OrderPlaced(bytes32 user, string source, string destination, uint256 deadline, uint256 nonce, uint256 fees, address session, bytes32 beneficiary, ${TOKEN_INFO} predispatch, ${TOKEN_INFO} inputs, ${TOKEN_INFO} outputs)`;
const ORDER_FILLED_ABI = `event OrderFilled(bytes32 indexed commitment, address filler, ${TOKEN_INFO} outputs, ${TOKEN_INFO} inputs)`;
const PARTIAL_FILL_ABI = `event PartialFill(bytes32 indexed commitment, address filler, ${TOKEN_INFO} outputs, ${TOKEN_INFO} inputs)`;

const iface = new ethers.utils.Interface([
  ...ISMP_OUTGOING_ABIS,
  ...ISMP_INCOMING_ABIS,
  ORDER_PLACED_ABI,
  ORDER_PLACED_LEGACY_ABI,
  ORDER_FILLED_ABI,
  PARTIAL_FILL_ABI,
]);

const bytes32ToAddress = (b: string): string => ethers.utils.getAddress("0x" + b.slice(-40));
const bytesToAddress = (b: string): string | undefined => (b.length === 42 ? ethers.utils.getAddress(b) : undefined);

const fetchLogs = async (chain: string, target: string, eventAbi: string, fromBlock: number, toBlock: number) => {
  incrementGetLogsCount("hyperbridge", chain);
  const logs = await getLogs({ target, eventAbi, fromBlock, toBlock, chain: chain as Chain, entireLog: true });
  return Array.isArray(logs?.[0]) ? (logs as any[][]).flat() : (logs as any[]);
};

const fetchAll = async (chain: string, target: string, abis: string[], fromBlock: number, toBlock: number) =>
  (await Promise.all(abis.map((abi) => fetchLogs(chain, target, abi, fromBlock, toBlock)))).flat();

const tokenEvents = (
  log: any,
  tokens: { token: string; amount: ethers.BigNumber }[],
  from: string,
  isDeposit: boolean
): EventData[] =>
  tokens
    .filter(({ amount }) => !ethers.BigNumber.from(amount).isZero())
    .map(({ token, amount }) => ({
      blockNumber: Number(log.blockNumber),
      txHash: log.transactionHash,
      from,
      to: INTENT_GATEWAY,
      token: bytes32ToAddress(token), // address(0) = native token
      amount: ethers.BigNumber.from(amount),
      isDeposit,
    }));

const getReceipt = async (provider: ethers.providers.Provider, txHash: string) => {
  let lastError: any;
  for (let i = 0; i < 3; i++) {
    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      if (receipt?.logs) return receipt;
      lastError = new Error(`no receipt for ${txHash}`);
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
};

type IsmpTx = { blockNumber: number; outgoing: boolean; modules: Set<string> };

// Group ISMP host events by tx and collect the modules that dispatched from it.
const groupIsmpTxs = (outgoingLogs: any[], incomingLogs: any[]): Map<string, IsmpTx> => {
  const txs = new Map<string, IsmpTx>();
  const get = (log: any) => {
    let tx = txs.get(log.transactionHash);
    if (!tx) {
      tx = { blockNumber: Number(log.blockNumber), outgoing: false, modules: new Set() };
      txs.set(log.transactionHash, tx);
    }
    return tx;
  };
  for (const log of incomingLogs) get(log);
  for (const log of outgoingLogs) {
    const tx = get(log);
    tx.outgoing = true;
    const from = iface.parseLog(log).args.from as string;
    const module = from.length === 42 ? from : bytesToAddress(from);
    if (module) tx.modules.add(module.toLowerCase());
  }
  return txs;
};

// Generic ISMP rule for any module (TokenGateway-style apps, HyperFungibleTokens, third parties):
//  outgoing tx -> transfers into a dispatching module, or burns, are deposits
//  incoming tx -> transfers out of a contract, or mints, are withdrawals
// IntentGateway txs are handled from its own events and skipped here, as are fee-token transfers to the host/handler.
const ismpTransfers = async (chain: string, txs: Map<string, IsmpTx>): Promise<EventData[]> => {
  const provider = getProvider(chain) as ethers.providers.Provider;
  const skip = new Set([ISMP_HOST, HANDLER, INTENT_GATEWAY].map((a) => a.toLowerCase()));
  const out: EventData[] = [];

  const { errors } = await PromisePool.withConcurrency(10)
    .for([...txs.entries()])
    .process(async ([txHash, tx]) => {
      if (tx.outgoing && [...tx.modules].every((m) => m === INTENT_GATEWAY.toLowerCase())) return;
      const receipt = await getReceipt(provider, txHash);
      if (receipt.logs.some((l) => l.address.toLowerCase() === INTENT_GATEWAY.toLowerCase())) return;
      const contracts = new Set(receipt.logs.map((l) => l.address.toLowerCase()));

      for (const log of receipt.logs) {
        if (log.topics[0] !== TRANSFER_TOPIC || log.topics.length !== 3) continue;
        const from = ethers.utils.getAddress("0x" + log.topics[1].slice(26));
        const to = ethers.utils.getAddress("0x" + log.topics[2].slice(26));
        const amount = ethers.BigNumber.from(log.data);
        if (amount.isZero() || skip.has(from.toLowerCase()) || skip.has(to.toLowerCase())) continue;

        const burn = to === ZERO;
        const mint = from === ZERO;
        let isDeposit: boolean;
        if (tx.outgoing) {
          if (!burn && !tx.modules.has(to.toLowerCase())) continue;
          isDeposit = true;
        } else {
          if (!mint && !contracts.has(from.toLowerCase())) continue;
          isDeposit = false;
        }

        out.push({
          blockNumber: tx.blockNumber,
          txHash,
          from: mint ? log.address : from,
          to: burn ? log.address : to,
          token: log.address,
          amount,
          isDeposit,
        });
      }
    });

  if (errors.length)
    throw new Error(`hyperbridge: ${errors.length} receipt lookups failed on ${chain}: ${errors[0].message}`);
  return out;
};

const constructParams = (chain: string) => {
  return async (fromBlock: number, toBlock: number): Promise<EventData[]> => {
    const [outgoing, incoming, placed, filled] = await Promise.all([
      fetchAll(chain, ISMP_HOST, ISMP_OUTGOING_ABIS, fromBlock, toBlock),
      fetchAll(chain, ISMP_HOST, ISMP_INCOMING_ABIS, fromBlock, toBlock),
      fetchAll(chain, INTENT_GATEWAY, [ORDER_PLACED_ABI, ORDER_PLACED_LEGACY_ABI], fromBlock, toBlock),
      fetchAll(chain, INTENT_GATEWAY, [ORDER_FILLED_ABI, PARTIAL_FILL_ABI], fromBlock, toBlock),
    ]);

    const out = await ismpTransfers(chain, groupIsmpTxs(outgoing, incoming));

    for (const log of placed) {
      const { user, inputs } = iface.parseLog(log).args;
      out.push(...tokenEvents(log, inputs, bytes32ToAddress(user), true));
    }
    for (const log of filled) {
      const { filler, outputs } = iface.parseLog(log).args;
      out.push(...tokenEvents(log, outputs, filler, false));
    }

    return out;
  };
};

const adapter: BridgeAdapter = Object.fromEntries(chains.map((chain) => [chain, constructParams(chain)]));

export default adapter;
