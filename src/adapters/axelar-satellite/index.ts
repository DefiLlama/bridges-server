import { Chain, ETHER_ADDRESS } from "@defillama/sdk/build/general";
import { getTimestamp, normalizeAddress } from "@defillama/sdk/build/util";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { FetchDepositTransfersOptions, FetchDepositTransfersResponse, LinkedDepositAddress } from "./type";
import { gatewayAddresses, supportedChains, withdrawParams } from "./constant";
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

async function fetchDepositAddressTransfers(
  fromBlock: number,
  toBlock: number,
  chain: string,
  options: FetchDepositTransfersOptions
): Promise<LinkedDepositAddress[]> {
  const { isDeposit = true, size = 2000 } = options;

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
        type: "deposit_address",
        fromTime,
        toTime,
        size,
        sourceChain: isDeposit ? mapChainToAxelarscanChain(chain) : undefined,
        destinationChain: isDeposit ? supportedChains.join(",") : mapChainToAxelarscanChain(chain),
      }),
    })
      .then((res) => res.json())
      .then((res: FetchDepositTransfersResponse) => res.data.map((d: any) => d.link))
  );
}

function constructDepositAddressTransfers(linkedDepositAddresses: LinkedDepositAddress[]) {
  const eventParams = [] as PartialContractEventParams[];

  for (const linkedDepositAddress of linkedDepositAddresses) {
    eventParams.push(constructTransferParams(linkedDepositAddress.deposit_address, true));
  }

  return eventParams;
}

function constructWithdrawAddressTransfers(
  linkedDepositAddresses: LinkedDepositAddress[],
  gateway: string,
  chain: string,
  assets: any[]
) {
  const _chain = mapChainToAxelarscanChain(chain);
  const eventParams = [] as PartialContractEventParams[];
  const withdrawTransfers = new Set(
    linkedDepositAddresses.map((d) => ({
      recipient: normalizeAddress(d.recipient_address),
      denom: d.denom,
    }))
  );

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
    const [deposits, withdraws, assets] = await retry(() =>
      Promise.all([
        fetchDepositAddressTransfers(fromBlock, toBlock, chain, {
          isDeposit: true,
        }),
        fetchDepositAddressTransfers(fromBlock, toBlock, chain, {
          isDeposit: false,
        }),
        fetchAssets(),
      ])
    );

    // console.log(`[${chain}] ${deposits.length} deposits`);
    // console.log(`[${chain}] ${withdraws.length} withdraws`);

    const eventParams = [
      ...constructDepositAddressTransfers(deposits),
      ...constructWithdrawAddressTransfers(withdraws, gateway, chain, assets),
    ];

    // console.log("Total listened events:", eventParams.length);

    return getTxDataFromEVMEventLogs("axelar-satellite", chain as Chain, fromBlock, toBlock, eventParams);
  };
};

const adapter: BridgeAdapter = {
  polygon: constructParams("polygon"),
  fantom: constructParams("fantom"),
  avax: constructParams("avax"),
  // bsc: constructParams("bsc"),
  ethereum: constructParams("ethereum"),
  arbitrum: constructParams("arbitrum"),
  optimism: constructParams("optimism"),
  linea: constructParams("linea"),
  base: constructParams("base"),
  moonbeam: constructParams("moonbeam"),
  celo: constructParams("celo"),
  kava: constructParams("kava"),
  filecoin: constructParams("filecoin"),
};

export default adapter;
