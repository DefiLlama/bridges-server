import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxsBlockRangeEtherscan, wait } from "../../helpers/etherscan";
import { EventData } from "../../utils/types";
import { BigNumber } from "ethers";
import { getLogs, GetLogsOptions } from "@defillama/sdk/build/util/logs";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const contractsByChain: Record<string, string[]> = {
  ethereum: ["0x7E6f983f93fd12114DaFE0C69d1e55023EE0abCB"],
  arbitrum: ["0x126Fc543AA75D1D8511390aEb0a5E49Ad8a245BC"],
  optimism: ["0x126Fc543AA75D1D8511390aEb0a5E49Ad8a245BC"],
  base: ["0xAE90b87324DA77113075E149455C53a88F6a01fb"],
  era: ["0xB4863f53332C89078575320C01E270032f71e486"],
  linea: ["0x320818EEFCF46ED1ec722f3bbC5B463EA1F5B619"],
};

const nativeTokens: Record<string, string> = {
  ethereum: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  arbitrum: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  optimism: "0x4200000000000000000000000000000000000006",
  base: "0x4200000000000000000000000000000000000006",
  era: "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
  linea: "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f",
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

    // Fetches contract Lock logs and maps `Id` to its transaction hash.
    const lockIdToTxHash = new Map<string, string>();

    const fetchLockLogs = async () => {
      try {
        const argsLockEvent = await Promise.all(
          contracts.map(async (contract) => {
            const options: GetLogsOptions = {
              target: contract,
              eventAbi:
                "event TokenLocked(bytes32 indexed Id, bytes32 hashlock, string dstChain, string dstAddress, string dstAsset, address indexed sender, address indexed srcReceiver, string srcAsset, uint256 amount, uint256 reward, uint48 rewardTimelock, uint48 timelock)",
              fromBlock: fromBlock,
              toBlock: toBlock,
              chain: chain as Chain,
              entireLog: true,
            };
            const logs = await getLogs(options);
            return logs;
          })
        );

        argsLockEvent.flat().forEach((log: any) => {
          const id = log.topics[1];
          const txHash = log.transactionHash;
          lockIdToTxHash.set(id, txHash);
        });
      } catch (error) {
        console.error("Error fetching lock logs:", error);
      }
    };

    await fetchLockLogs();

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
    const matchingCommitTxHashes: string[] = [];

    redeemIds.forEach((redeemId) => {
      if (commitIdToTxHash.has(redeemId)) {
        const txHash = commitIdToTxHash.get(redeemId);
        matchingCommitTxHashes.push(txHash!);
      }
    });

    const matchingCommitTxHashesSet = new Set(matchingCommitTxHashes);

    // Loop over Redeem Ids, check if an entry exists in lockIdToTxHash, and store the corresponding txHash
    const matchingLockTxHashes: string[] = [];

    redeemIds.forEach((redeemId) => {
      if (lockIdToTxHash.has(redeemId)) {
        const txHash = lockIdToTxHash.get(redeemId);
        matchingLockTxHashes.push(txHash!);
      }
    });

    const matchingLockTxHashesSet = new Set(matchingLockTxHashes);

    // commit event params
    const commitParams: PartialContractEventParams = {
      target: "",
      topic:
        "TokenCommitted(bytes32,string[],string[],string[],string,string,string,address,address,string,uint256,uint48)",
      abi: [
        "event TokenCommitted(bytes32 indexed Id,string[] hopChains,string[] hopAssets,string[] hopAddresses,string dstChain,string dstAddress,string dstAsset,address indexed sender,address indexed srcReceiver,string srcAsset,uint256 amount,uint48 timelock)",
      ],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
      argKeys: {
        amount: "amount",
        from: "sender",
      },
      fixedEventData: {
        token: nativeTokens[chain.toString()],
        to: contractsByChain[chain.toString()][0],
      },
      isDeposit: true,
    };

    //lock event params
    const lockParams: PartialContractEventParams = {
      target: "",
      topic: "TokenLocked(bytes32,bytes32,string,string,string,address,address,string,uint256,uint256,uint48,uint48)",
      abi: [
        "event TokenLocked(bytes32 indexed Id, bytes32 hashlock, string dstChain, string dstAddress, string dstAsset, address indexed sender, address indexed srcReceiver, string srcAsset, uint256 amount, uint256 reward, uint48 rewardTimelock, uint48 timelock)",
      ],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
      argKeys: {
        amount: "amount",
        from: "sender",
      },
      fixedEventData: {
        token: nativeTokens[chain.toString()],
        to: contractsByChain[chain.toString()][0],
      },
      isDeposit: false,
    };

    // Combine both sets for filtering:
    const combinedMatchingTxHashesSet = new Set([...matchingCommitTxHashesSet, ...matchingLockTxHashesSet]);

    // Build unified event parameters for both commit and lock events for all contracts
    const allEventParams: PartialContractEventParams[] = [];
    contracts.forEach((address: string) => {
      // Append commit event params with target address
      allEventParams.push({ ...commitParams, target: address });
      // Append lock event params with target address
      allEventParams.push({ ...lockParams, target: address });
    });

    // Fetch all event logs (for both commit and lock events)
    const eventLogData = await getTxDataFromEVMEventLogs("train", chain as Chain, fromBlock, toBlock, allEventParams);

    // Extract tx hashes from the fetched event logs and filter those present in the combined set:
    let allTxHashes = eventLogData.map((tx: any) => tx.txHash);
    allTxHashes = allTxHashes.filter((txHash) => {
      if (combinedMatchingTxHashesSet.has(txHash)) {
        combinedMatchingTxHashesSet.delete(txHash);
        return true;
      }
      return false;
    });

    const filteredEventLogData = eventLogData.filter((event) => allTxHashes.includes(event.txHash));

    const allEvents: EventData[] = [...filteredEventLogData];
    return allEvents;
  };
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  arbitrum: constructParams("arbitrum"),
  optimism: constructParams("optimism"),
  "zksync era": constructParams("era"),
  base: constructParams("base"),
  linea: constructParams("linea"),
};
export default adapter;
