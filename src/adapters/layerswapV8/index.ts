import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import { getTxsBlockRangeEtherscan, wait } from "../../helpers/etherscan";
import { EventData } from "../../utils/types";
import { BigNumber } from "ethers";

const blackListedAddresses = ["0xe2e1808ed4cc4a6f701696086838f511ee187d57"].map((a) => a.toLowerCase());

const contracts = [
  "0xe2dDb832c0ed81b7ec097E9c9d3b20CEbbe01407",
  "0xd40Fd3870067292E3AE1b26445419bd9CF0C7595",
  "0x24B55020dF66FB3dA349d551294f0d57B8266e97",
  "0x320818EEFCF46ED1ec722f3bbC5B463EA1F5B619",
];

const nativeTokens: Record<string, string> = {
  ethereum: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  arbitrum: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  optimism: "0x4200000000000000000000000000000000000006",
  base: "0x4200000000000000000000000000000000000006",
};

const constructParams = (chain: string) => {
  return async (fromBlock: number, toBlock: number) => {
    const nativeEvents = await Promise.all(
      contracts.map(async (address: string, i: number) => {
        await wait(500 * i); // for etherscan
        let txs: any[] = [];
        txs = await getTxsBlockRangeEtherscan(chain, address, fromBlock, toBlock, {});
        const eventsRes: EventData[] = txs.map((tx: any) => {
          const event: EventData = {
            txHash: tx.hash,
            blockNumber: +tx.blockNumber,
            from: tx.from,
            to: tx.to,
            token: nativeTokens[chain],
            amount: BigNumber.from(tx.value),
            isDeposit: address === tx.to,
          };
          return event;
        });

        return eventsRes;
      })
    );

    const allEvents: EventData[] = [...nativeEvents.flat()];
    const filteredEvents = allEvents.filter(
      (event) =>
        !blackListedAddresses.includes(event?.from?.toLowerCase()) &&
        !blackListedAddresses.includes(event?.to?.toLowerCase())
    );
    return filteredEvents;
  };
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  arbitrum: constructParams("arbitrum"),
  optimism: constructParams("optimism"),
  base: constructParams("base"),
};
export default adapter;
