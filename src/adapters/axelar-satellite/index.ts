import { Chain, ETHER_ADDRESS } from "@defillama/sdk/build/general";
import { getTimestamp } from "@defillama/sdk/build/util";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import fetch from "node-fetch";
import { FetchDepositTransfersOptions, FetchDepositTransfersResponse, LinkedDepositAddress } from "./type";
import { gatewayAddresses, supportedChains } from "./constant";
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

const withdrawParams = (fromAddress: string, recipientAddress: string) => ({
  target: "0x408fbd65741e2afdc2866f9312f21063837edbf0",
  topic: "Transfer(address,address,uint256)",
  abi: ["event Transfer(address indexed from, address indexed to, uint256 value)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  txKeys: {
    from: "from",
    to: "to",
    amount: "amount",
  },
  fixedEventData: {
    from: fromAddress,
    to: recipientAddress,
  },
  isDeposit: false,
});

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
      .catch((err) => {
        console.log(err);
      })
  );
}

function constructDepositAddressTransfers(linkedDepositAddresses: LinkedDepositAddress[]) {
  const eventParams = [] as PartialContractEventParams[];

  for (const linkedDepositAddress of linkedDepositAddresses) {
    eventParams.push(constructTransferParams(linkedDepositAddress.deposit_address, true));
  }

  return eventParams;
}

function constructWithdrawAddressTransfers(linkedDepositAddresses: LinkedDepositAddress[], gateway: string) {
  const eventParams = [] as PartialContractEventParams[];
  const uniqueRecipientAddresses = new Set(linkedDepositAddresses.map((d) => d.recipient_address));

  for (const recipientAddress of uniqueRecipientAddresses) {
    const eventParam = constructTransferParams(ETHER_ADDRESS, false, {
      includeTo: [recipientAddress],
    });
    const eventParam2 = constructTransferParams(gateway, false, {
      includeTo: [recipientAddress],
    });
    eventParams.push(eventParam);

    // console.log("linkedDepositAddress", gateway, recipientAddress);
    // const eventParam2 = withdrawParams(gateway, recipientAddress);
    // eventParams.push(eventParam2, withdrawParams(ETHER_ADDRESS, recipientAddress));
  }

  return eventParams;
}

const constructParams = (chain: string) => {
  const gateway = gatewayAddresses[chain];

  return async (fromBlock: number, toBlock: number) => {
    const [deposits, withdraws] = await retry(() =>
      Promise.all([
        fetchDepositAddressTransfers(fromBlock, toBlock, chain, {
          isDeposit: true,
        }),
        fetchDepositAddressTransfers(fromBlock, toBlock, chain, {
          isDeposit: false,
        }),
      ])
    );

    // logs
    console.log(`[${chain}] ${deposits.length} deposits`);
    console.log(`[${chain}] ${withdraws.length} withdraws`);

    const eventParams = [
      ...constructDepositAddressTransfers(deposits),
      ...constructWithdrawAddressTransfers(withdraws, gateway),
    ];

    console.log("eventParams", eventParams.length);

    return getTxDataFromEVMEventLogs("axelar-satellite", chain as Chain, fromBlock, toBlock, eventParams);
  };
};

const adapter: BridgeAdapter = {
  // polygon: constructParams("polygon"),
  fantom: constructParams("fantom"),
  // avax: constructParams("avax"),
  // bsc: constructParams("bsc"),
  // ethereum: constructParams("ethereum"),
  // arbitrum: constructParams("arbitrum"),
  // optimism: constructParams("optimism"),
};

export default adapter;
