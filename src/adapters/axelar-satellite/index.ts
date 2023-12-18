import { Chain, ETHER_ADDRESS } from "@defillama/sdk/build/general";
import { getTimestamp, normalizeAddress } from "@defillama/sdk/build/util";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
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
const retry = require("async-retry");

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

function fetchAssets() {
  // fetch from axelarscan and pass {"method": "getAssets"} as json body
  return retry(() =>
    fetch("https://api.axelarscan.io/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        method: "getAssets",
      }),
    }).then((res) => res.json())
  );
}

async function fetchDepositAddressTransfers<T extends DepositAddressTransfer>(
  fromBlock: number,
  toBlock: number,
  chain: string,
  options: FetchDepositTransfersOptions
): Promise<T[]> {
  const { isDeposit = true, type = "deposit_address", size = 2000 } = options;
  const typeToResponseObj = {
    deposit_address: "link",
    wrap: "wrap",
  };

  // Fetch timestamp from block numbers
  const [fromTime, toTime] = await retry(() =>
    Promise.all([getTimestamp(fromBlock, chain), getTimestamp(toBlock, chain)])
  );

  // Get deposit addresses from the axelarscan API
  return retry(() =>
    fetch("https://api.axelarscan.io/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        method: "searchTransfers",
        type,
        fromTime,
        toTime,
        size,
        sourceChain: isDeposit ? mapChainToAxelarscanChain(chain) : undefined,
        destinationChain: isDeposit ? undefined : mapChainToAxelarscanChain(chain),
      }),
    })
      .then((res) => res.json())
      .then((res: FetchDepositTransfersResponse) =>
        res.data.map((d: any) => ({
          ...d[typeToResponseObj[type]],
          denom: d.send.denom.startsWith("ibc") ? d.link.denom : d.send.denom,
        }))
      )
  );
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

  return async (fromBlock: number, toBlock: number) => {
    const [deposits, wraps, withdraws, assets] = await retry(() =>
      Promise.all([
        fetchDepositAddressTransfers<DepositAddressTransfer>(fromBlock, toBlock, chain, {
          isDeposit: true,
        }),
        fetchDepositAddressTransfers<WrapTransfer>(fromBlock, toBlock, chain, {
          isDeposit: true,
          type: "wrap",
        }),
        fetchDepositAddressTransfers<DepositAddressTransfer>(fromBlock, toBlock, chain, {
          isDeposit: false,
        }),
        fetchAssets(),
      ])
    );

    // console.log(`[${chain}] ${deposits.length} deposits`);
    // console.log(`[${chain}] ${wraps.length} wraps`);
    // console.log(`[${chain}] ${withdraws.length} withdraws`);

    const eventParams = [
      ...constructDepositAddressTransfers(deposits),
      ...constructWrapTransfers(wraps, gateway, chain, assets),
      ...constructWithdrawAddressTransfers(withdraws, gateway, chain, assets),
    ];

    // console.log("Total listened events:", eventParams.length);

    return getTxDataFromEVMEventLogs("axelar-satellite", chain as Chain, fromBlock, toBlock, eventParams);
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
