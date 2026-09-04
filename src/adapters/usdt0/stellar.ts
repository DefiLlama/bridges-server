import { BigNumber } from "ethers";
import { getContractEvents } from "../../helpers/stellar";
import { EventData } from "../../utils/types";

export const constructStellarParams = ({ oapp, token }: { oapp: string; token: string }) => {
  return async (fromBlock: number, toBlock: number): Promise<EventData[]> => {
    const events = await getContractEvents(oapp, fromBlock, toBlock);
    return events.flatMap((event) => {
      const eventName = event.topicJson[0].symbol;
      if (eventName !== "oft_sent" && eventName !== "oft_received") return [];
      const isDeposit = eventName === "oft_sent";
      const counterparty = event.topicJson[3].address; // topics are (name, guid, peer eid, counterparty)
      const amountKey = isDeposit ? "amount_sent_ld" : "amount_received_ld";
      const amount = event.valueJson.map.find((entry: any) => entry.key.symbol === amountKey).val.i128;
      return [
        {
          blockNumber: event.ledger,
          txHash: event.txHash,
          from: isDeposit ? counterparty : token,
          to: isDeposit ? token : counterparty,
          token,
          amount: BigNumber.from(amount),
          isDeposit,
          timestamp: Date.parse(event.ledgerClosedAt),
        },
      ];
    });
  };
};
