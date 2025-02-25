import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxsBlockRangeEtherscan, wait } from "../../helpers/etherscan";
import { EventData } from "../../utils/types";
import { BigNumber } from "ethers";
import { getLogs, GetLogsOptions } from "@defillama/sdk/build/util/logs";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const contractsByChain: Record<string, string[]> = {
  ethereum: ["0x7E6f983f93fd12114DaFE0C69d1e55023EE0abCB"],
  arbitrum: ["0x126Fc543AA75D1D8511390aEb0a5E49Ad8a245BC"],
  optimism: ["0x126Fc543AA75D1D8511390aEb0a5E49Ad8a245BC"],
  base: ["0xAE90b87324DA77113075E149455C53a88F6a01fb"],
  era: ["0xB4863f53332C89078575320C01E270032f71e486"],
};

const nativeTokens: Record<string, string> = {
  ethereum: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  arbitrum: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  optimism: "0x4200000000000000000000000000000000000006",
  base: "0x4200000000000000000000000000000000000006",
  era: "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
};

const constructParams = (chain: string) => {
  const contracts = [...(contractsByChain[chain] || [])];

  return async (fromBlock: number, toBlock: number) => {
    // Fetches contract Commit logs and maps `Id` to its transaction hash.
    const commitIdToTxHash = new Map<string, string>();
    const fetchCommitLogs = async () => {
      try {
        const argsCommitEvent = await Promise.all(
          contracts.map(async (contract) => {
            const options: GetLogsOptions = {
              target: contract,
              eventAbi:
                "event TokenCommitted(bytes32 indexed Id,string[] hopChains,string[] hopAssets,string[] hopAddresses,string dstChain,string dstAddress,string dstAsset,address indexed sender,address indexed srcReceiver,string srcAsset,uint256 amount,uint48 timelock)",
              fromBlock: fromBlock,
              toBlock: toBlock,
              chain: chain as Chain,
              entireLog: true,
            };
            const logs = await getLogs(options);
            return logs;
          })
        );

        argsCommitEvent.flat().forEach((log: any) => {
          const id = log.topics[1];
          const txHash = log.transactionHash;
          commitIdToTxHash.set(id, txHash);
        });
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };
    await fetchCommitLogs();

    // Fetches contract Redeem logs and stores `Id`
    const redeemIds: string[] = [];

    const fetchRedeemLogs = async () => {
      try {
        const argsRedeemEvent = await Promise.all(
          contracts.map(async (contract) => {
            const options: GetLogsOptions = {
              target: contract,
              eventAbi:
                "event TokenRedeemed(bytes32 indexed Id, address redeemAddress, uint256 secret, bytes32 hashlock)",
              fromBlock: fromBlock,
              toBlock: toBlock,
              chain: chain as Chain,
              entireLog: true,
            };
            const logs = await getLogs(options);
            return logs;
          })
        );

        argsRedeemEvent.flat().forEach((log: any) => {
          const id = log.topics[1];
          redeemIds.push(id);
        });
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };
    await fetchRedeemLogs();

    // Loop over Redeem Ids, check if an entry exists in commitIdToTxHash, and store the corresponding txHash
    const matchingTxHashes: string[] = [];

    redeemIds.forEach((redeemId) => {
      if (commitIdToTxHash.has(redeemId)) {
        const txHash = commitIdToTxHash.get(redeemId);
        matchingTxHashes.push(txHash!);
      }
    });

    const matchingTxHashesSet = new Set(matchingTxHashes);

    // Fetch all deposit token transfer events and store tx hashes
    let eventParams = [] as any;
    contracts.map((address: string) => {
      const transferDepositParams: PartialContractEventParams = constructTransferParams(address, true);
      eventParams.push(transferDepositParams);
    });

    const eventLogData = await getTxDataFromEVMEventLogs(
      "train",
      chain as Chain,
      fromBlock,
      toBlock,
      eventParams
    );
    let ercTransferTxHashes = eventLogData.map((tx: any) => tx.txHash);

    // Preserve hashes in ercTransferTxHashes that exist in matchingTxHashesSet, remove others
    ercTransferTxHashes = ercTransferTxHashes.filter((txHash) => {
      if (matchingTxHashesSet.has(txHash)) {
        matchingTxHashesSet.delete(txHash);
        return true;
      }
      return false;
    });

    const filteredEventLogData = eventLogData.filter((event) => ercTransferTxHashes.includes(event.txHash));

    // Fetch and filter transactions, mapping matching hashes to EventData objects.
    const nativeEvents = await Promise.all(
      contracts.map(async (address: string, i: number) => {
        await wait(500 * i);
        const txs: any[] = await getTxsBlockRangeEtherscan(chain, address, fromBlock, toBlock, {});

        const eventsRes: EventData[] = txs
          .filter((tx) => matchingTxHashesSet.has(tx.hash))
          .map((tx: any) => {
            const event: EventData = {
              txHash: tx.hash,
              blockNumber: +tx.blockNumber,
              from: tx.from,
              to: tx.to,
              token: nativeTokens[chain],
              amount: BigNumber.from(tx.value),
              isDeposit: true,
            };
            return event;
          });

        return eventsRes;
      })
    );

    const allEvents: EventData[] = [...nativeEvents.flat(), ...filteredEventLogData];
    return allEvents;
  };
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  arbitrum: constructParams("arbitrum"),
  optimism: constructParams("optimism"),
  "zksync era": constructParams("era"),
  base: constructParams("base"),
};
export default adapter;
