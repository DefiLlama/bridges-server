import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { getLogs } from "@defillama/sdk/build/util";
import { getProvider } from "../../utils/provider";
import { ethers } from "ethers";
import { EventData } from "../../utils/types";

/*
Robinhood Chain is an Arbitrum Orbit chain. Only ETH is bridged through the canonical
bridge (its native assets, e.g. tokenized equities, are minted on-chain, not bridged),
so contracts are tracked on the Ethereum (L1) side, like the arbitrum adapter.

0x1a07cc4bd17e0118bdb54d70990d2158abad7a2d is Robinhood: Delayed Inbox
  -deposits of ETH
0xDf8755334ce7A73cCF6b581C02eA649AE3E864b3 is Robinhood: Bridge
  -withdrawals of ETH
*/

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const INBOX = "0x1a07cc4bd17e0118bdb54d70990d2158abad7a2d";
const BRIDGE = "0xDf8755334ce7A73cCF6b581C02eA649AE3E864b3";

// ETH withdrawals: released from the Bridge via an outbox call with empty calldata.
const ethWithdrawalParams: PartialContractEventParams = {
  target: BRIDGE,
  topic: "BridgeCallTriggered(address,address,uint256,bytes)",
  abi: ["event BridgeCallTriggered(address indexed outbox, address indexed to, uint256 value, bytes data)"],
  argKeys: {
    amount: "value",
    to: "to",
  },
  fixedEventData: {
    from: BRIDGE,
    token: WETH,
  },
  isDeposit: false,
  filter: {
    includeArg: [{ data: "0x" }],
  },
};

// ETH deposits: sent to the Inbox. The shared txKeys path can't read the deposit amount
// (getProvider returns tx.value as a hex string, which fails the helper's type check), so
// build deposit events manually from the tx value, like the base adapter does.
const getDepositEvents = async (fromBlock: number, toBlock: number): Promise<EventData[]> => {
  const logs = (
    await getLogs({
      target: INBOX,
      topic: "InboxMessageDelivered(uint256,bytes)",
      keys: [],
      fromBlock,
      toBlock,
      chain: "ethereum",
    })
  ).output;

  const provider = getProvider("ethereum") as any;
  const events: EventData[] = [];
  const seenTxs = new Set<string>();
  for (const log of logs) {
    const txHash = log.transactionHash;
    if (seenTxs.has(txHash)) continue; // one tx can emit multiple inbox messages
    seenTxs.add(txHash);
    const tx = await provider.getTransaction(txHash);
    if (!tx?.value) continue;
    const amount = ethers.BigNumber.from(tx.value);
    if (amount.isZero()) continue;
    events.push({
      blockNumber: log.blockNumber,
      txHash,
      from: tx.from,
      to: INBOX,
      token: WETH,
      amount,
      isDeposit: true,
    });
  }
  return events;
};

const constructParams = () => {
  return async (fromBlock: number, toBlock: number) => {
    const [withdrawalEvents, depositEvents] = await Promise.all([
      getTxDataFromEVMEventLogs("robinhood", "ethereum", fromBlock, toBlock, [ethWithdrawalParams]),
      getDepositEvents(fromBlock, toBlock),
    ]);
    return [...depositEvents, ...withdrawalEvents];
  };
};

const adapter: BridgeAdapter = {
  ethereum: constructParams(),
};

export default adapter;
