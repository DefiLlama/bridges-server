import { Chain, ETHER_ADDRESS } from "@defillama/sdk/build/general";
import { getTimestamp, normalizeAddress } from "@defillama/sdk/build/util";
import { AdapterRunContext, BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import {
  FetchDepositTransfersOptions,
  FetchDepositTransfersResponse,
  DepositAddressTransfer,
  WrapTransfer,
} from "./type";
import { gatewayAddresses, withdrawParams, wrapParams } from "./constant";
import fetch from "node-fetch";
import {
  formatError,
  isAbortError,
  isNonRetryableError,
  NonRetryableError,
  throwIfAborted,
  waitWithSignal,
} from "../../utils/errors";
const retry = require("async-retry");

const AXELAR_API_URL = "https://api.axelarscan.io/";
const AXELAR_REQUEST_TIMEOUT_MS = 30_000;
const AXELAR_REQUEST_INTERVAL_MS = 350;
const AXELAR_REQUEST_CONCURRENCY = 3;
const AXELAR_REQUEST_RETRIES = 3;

let activeAxelarRequests = 0;
let nextAxelarRequestAt = 0;
const axelarWaiters: Array<() => void> = [];
let assetsPromise: Promise<any[]> | undefined;

const acquireAxelarSlot = async (signal?: AbortSignal) => {
  throwIfAborted(signal);
  if (activeAxelarRequests >= AXELAR_REQUEST_CONCURRENCY) {
    await new Promise<void>((resolve, reject) => {
      const onAbort = () => {
        const index = axelarWaiters.indexOf(onReady);
        if (index >= 0) axelarWaiters.splice(index, 1);
        signal?.removeEventListener("abort", onAbort);
        reject(Object.assign(new Error("Operation aborted"), { name: "AbortError" }));
      };
      const onReady = () => {
        signal?.removeEventListener("abort", onAbort);
        resolve();
      };
      axelarWaiters.push(onReady);
      signal?.addEventListener("abort", onAbort, { once: true });
      if (signal?.aborted) onAbort();
    });
  } else {
    activeAxelarRequests++;
  }
  try {
    throwIfAborted(signal);
    const now = Date.now();
    const requestAt = Math.max(now, nextAxelarRequestAt);
    nextAxelarRequestAt = requestAt + AXELAR_REQUEST_INTERVAL_MS;
    if (requestAt > now) await waitWithSignal(requestAt - now, signal);
  } catch (error) {
    releaseAxelarSlot();
    throw error;
  }
};

const releaseAxelarSlot = () => {
  const nextWaiter = axelarWaiters.shift();
  if (nextWaiter) {
    // Transfer the existing permit directly to the waiter. Keeping the active
    // count unchanged closes the gap where a new caller could steal the slot.
    nextWaiter();
    return;
  }
  activeAxelarRequests = Math.max(0, activeAxelarRequests - 1);
};

const fetchAxelar = async <T>(body: Record<string, unknown>, signal?: AbortSignal): Promise<T> =>
  retry(
    async (bail: (error: Error) => never) => {
      let acquired = false;
      try {
        throwIfAborted(signal);
        await acquireAxelarSlot(signal);
        acquired = true;
        const response = await fetch(AXELAR_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          timeout: AXELAR_REQUEST_TIMEOUT_MS,
          signal,
        });
        if (!response.ok) {
          const responseBody = await response.text().catch(() => "");
          const error =
            response.status !== 429 && response.status < 500
              ? new NonRetryableError(`Axelarscan HTTP ${response.status}: ${responseBody.slice(0, 300)}`)
              : new Error(`Axelarscan HTTP ${response.status}: ${responseBody.slice(0, 300)}`);
          throw error;
        }
        return (await response.json()) as T;
      } catch (error) {
        if (isAbortError(error) || signal?.aborted || isNonRetryableError(error)) return bail(error as Error);
        throw error;
      } finally {
        if (acquired) releaseAxelarSlot();
      }
    },
    {
      retries: AXELAR_REQUEST_RETRIES,
      factor: 2,
      minTimeout: 1_000,
      maxTimeout: 10_000,
      randomize: true,
    }
  );

function mapChainToAxelarscanChain(chain: Chain) {
  switch (chain) {
    case "bsc":
      return "binance";
    case "avax":
      return "avalanche";
    default:
      return chain;
  }
}

function fetchAssets(signal?: AbortSignal) {
  if (!assetsPromise) {
    assetsPromise = fetchAxelar<any[]>({ method: "getAssets" }, signal).catch((error) => {
      assetsPromise = undefined;
      throw error;
    });
  }
  return assetsPromise;
}

async function fetchDepositAddressTransfers<T extends DepositAddressTransfer>(
  fromBlock: number,
  toBlock: number,
  chain: string,
  options: FetchDepositTransfersOptions,
  signal?: AbortSignal
): Promise<T[]> {
  const { isDeposit = true, type = "deposit_address", size = 2000 } = options;
  const typeToResponseObj = {
    deposit_address: "link",
    wrap: "wrap",
  };

  // Fetch timestamp from block numbers
  const [fromTime, toTime] = await retry(async (bail: (error: Error) => never) => {
    throwIfAborted(signal);
    try {
      return await Promise.all([getTimestamp(fromBlock, chain), getTimestamp(toBlock, chain)]);
    } catch (error) {
      if (isAbortError(error) || signal?.aborted) return bail(error as Error);
      throw error;
    }
  });

  // Get deposit addresses from the axelarscan API
  const response = await fetchAxelar<FetchDepositTransfersResponse>(
    {
      method: "searchTransfers",
      type,
      fromTime,
      toTime,
      size,
      sourceChain: isDeposit ? mapChainToAxelarscanChain(chain) : undefined,
      destinationChain: isDeposit ? undefined : mapChainToAxelarscanChain(chain),
    },
    signal
  );
  if (!Array.isArray(response?.data)) {
    throw new NonRetryableError(
      `Axelarscan returned invalid searchTransfers data for ${chain}: ${formatError(response)}`
    );
  }
  if (response.data.length >= size) {
    if (fromBlock >= toBlock) {
      throw new NonRetryableError(
        `Axelarscan returned the configured ${size}-record limit for ${chain} in block ${fromBlock}; refusing to advance checkpoint.`
      );
    }
    const midpoint = Math.floor((fromBlock + toBlock) / 2);
    console.warn(`[axelar-satellite] Splitting saturated ${chain} range ${fromBlock}-${toBlock} at ${midpoint}.`);
    const left = await fetchDepositAddressTransfers<T>(fromBlock, midpoint, chain, options, signal);
    const right = await fetchDepositAddressTransfers<T>(midpoint + 1, toBlock, chain, options, signal);
    return Array.from(new Map([...left, ...right].map((transfer) => [JSON.stringify(transfer), transfer])).values());
  }
  return response.data.map((d: any) => ({
    ...d[typeToResponseObj[type]],
    denom: d.send.denom.startsWith("ibc") ? d.link.denom : d.send.denom,
  }));
}

function constructDepositAddressTransfers(linkedDepositAddresses: DepositAddressTransfer[]) {
  const eventParams = [] as PartialContractEventParams[];

  for (const linkedDepositAddress of linkedDepositAddresses) {
    eventParams.push(constructTransferParams(linkedDepositAddress.deposit_address, true));
  }

  return eventParams;
}

function constructWrapTransfers(wrapTransfers: WrapTransfer[], gateway: string, chain: string, assets: any[]) {
  const eventParams = [] as PartialContractEventParams[];
  if (wrapTransfers.length === 0) return eventParams;

  const asset = assets.find((asset) => asset.denom === wrapTransfers[0].denom);

  if (!asset || !asset?.addresses?.[chain]?.address) {
    // console.log(`[${chain}] Asset not found`, wrapTransfers[0].denom);
    return eventParams;
  }

  const token = normalizeAddress(asset?.addresses?.[chain]?.address);

  for (const wrapTransfer of wrapTransfers) {
    eventParams.push({
      ...wrapParams(wrapTransfer.deposit_address, gateway),
      target: token,
      fixedEventData: {
        token: token,
        from: token,
      },
    });
  }

  return eventParams;
}

function constructWithdrawAddressTransfers(
  linkedDepositAddresses: DepositAddressTransfer[],
  gateway: string,
  chain: string,
  assets: any[]
) {
  const _chain = mapChainToAxelarscanChain(chain);
  const eventParams = [] as PartialContractEventParams[];
  const withdrawTransfers = linkedDepositAddresses.map((d) => ({
    recipient: normalizeAddress(d.recipient_address),
    denom: d.denom,
  }));

  for (const withdraw of withdrawTransfers) {
    const asset = assets.find((asset) => asset.denom === withdraw.denom);
    if (!asset) {
      // console.log(`[${_chain}] Asset not found`, withdraw.denom, withdraw.recipient);
      continue;
    }

    const token = normalizeAddress(asset?.addresses[_chain]?.address);
    const isNativeChain = asset.native_chain === _chain;

    if (isNativeChain) {
      // token will be transfered from gateway contract.
      const param = {
        ...withdrawParams(gateway, normalizeAddress(withdraw.recipient)),
        target: token,
        fixedEventData: {
          token: token,
          from: token,
        },
      };
      eventParams.push(param);
    } else {
      // token will be minted from zero address.
      const param = {
        ...withdrawParams(ETHER_ADDRESS, normalizeAddress(withdraw.recipient)),
        target: token,
        fixedEventData: {
          token: token,
          from: token,
        },
      };
      eventParams.push(param);
    }
  }

  return eventParams;
}

const constructParams = (chain: string) => {
  const gateway = normalizeAddress(gatewayAddresses[chain]);

  return async (fromBlock: number, toBlock: number, context?: AdapterRunContext) => {
    const signal = context?.signal;
    throwIfAborted(signal);
    const [deposits, wraps, withdraws, assets] = await Promise.all([
      fetchDepositAddressTransfers<DepositAddressTransfer>(
        fromBlock,
        toBlock,
        chain,
        {
          isDeposit: true,
        },
        signal
      ),
      fetchDepositAddressTransfers<WrapTransfer>(
        fromBlock,
        toBlock,
        chain,
        {
          isDeposit: true,
          type: "wrap",
        },
        signal
      ),
      fetchDepositAddressTransfers<DepositAddressTransfer>(
        fromBlock,
        toBlock,
        chain,
        {
          isDeposit: false,
        },
        signal
      ),
      fetchAssets(signal),
    ]);
    throwIfAborted(signal);

    // console.log(`[${chain}] ${deposits.length} deposits`);
    // console.log(`[${chain}] ${wraps.length} wraps`);
    // console.log(`[${chain}] ${withdraws.length} withdraws`);

    const eventParams = [
      ...constructDepositAddressTransfers(deposits),
      ...constructWrapTransfers(wraps, gateway, chain, assets),
      ...constructWithdrawAddressTransfers(withdraws, gateway, chain, assets),
    ];

    // console.log("Total listened events:", eventParams.length);

    return getTxDataFromEVMEventLogs("axelar-satellite", chain as Chain, fromBlock, toBlock, eventParams, signal);
  };
};

const adapter: BridgeAdapter = {
  fantom: constructParams("fantom"),
  avalanche: constructParams("avax"),
  ethereum: constructParams("ethereum"),
  arbitrum: constructParams("arbitrum"),
  optimism: constructParams("optimism"),
  linea: constructParams("linea"),
  base: constructParams("base"),
  moonbeam: constructParams("moonbeam"),
  kava: constructParams("kava"),
  filecoin: constructParams("filecoin"),
  polygon: constructParams("polygon"),
  bsc: constructParams("bsc"),
  celo: constructParams("celo"),
  mantle: constructParams("mantle"),
};

export default adapter;
