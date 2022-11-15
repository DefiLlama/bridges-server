import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxsBlockRangeEtherscan, etherscanWait } from "../../helpers/etherscan";
import { EventData } from "../../utils/types";
import { getProvider } from "@defillama/sdk/build/general";
import { ethers } from "ethers";

/*
Contracts: https://book.wormhole.com/reference/contracts.html

***Ethereum***
0x3ee18B2214AFF97000D974cf647E7C347E8fa585 is Wormhole: Portal Token Bridge

***Polygon***
0x5a58505a96D1dbf8dF91cB21B54419FC36e93fdE is Wormhole: Portal Token Bridge

***BSC***
0xB6F6D86a8f9879A9c87f643768d9efc38c1Da6E7 is Wormhole: Portal Token Bridge

***Fantom***
0x7C9Fc5741288cDFdD83CeB07f3ea7e22618D79D2 is Wormhole: Portal Token Bridge

***Avalanche***
0x0e082F06FF657D94310cB8cE8B0D9a04541d8052 is Wormhole: Portal Token Bridge

***Aurora***
0x51b5123a7b0F9b2bA265f9c4C8de7D78D52f510F is Wormhole: Portal Token Bridge

***Celo***
0x796Dff6D74F3E27060B71255Fe517BFb23C93eed is Wormhole: Portal Token Bridge

***Klaytn***
0x5b08ac39EAED75c0439FC750d9FE7E1F9dD0193F is Wormhole: Portal Token Bridge
*/

const contractAddresses = {
  ethereum: {
    tokenBridge: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
    nativeToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  polygon: {
    tokenBridge: "0x5a58505a96D1dbf8dF91cB21B54419FC36e93fdE",
    nativeToken: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  },
  fantom: {
    tokenBridge: "0x7C9Fc5741288cDFdD83CeB07f3ea7e22618D79D2",
    nativeToken: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
  },
  avax: {
    tokenBridge: "0x0e082F06FF657D94310cB8cE8B0D9a04541d8052",
    nativeToken: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
  },
  bsc: {
    tokenBridge: "0xB6F6D86a8f9879A9c87f643768d9efc38c1Da6E7",
    nativeToken: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  },
  aurora: {
    tokenBridge: "0x51b5123a7b0F9b2bA265f9c4C8de7D78D52f510F",
    nativeToken: "0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB",
  },
  celo: {
    tokenBridge: "0x796Dff6D74F3E27060B71255Fe517BFb23C93eed",
    nativeToken: "0x471EcE3750Da237f93B8E339c536989b8978a438",
  },
  klaytn: {
    tokenBridge: "0x5b08ac39EAED75c0439FC750d9FE7E1F9dD0193F",
    nativeToken: "0xe4f05a66ec68b54a58b17c22107b02e0232cc817",
  },
} as {
  [chain: string]: {
    tokenBridge: string;
    nativeToken: string;
  };
};

const nativeAndWrappedTokenTransferSignatures = [
  "0x998150", // native token xfers
  "0xff200c",
  "0xc68785", // wrapped token xfers
  "0x0f5287",
];

const depositInputDataExtraction = {
  inputDataABI: [
    "function transferTokens(address token,uint256 amount,uint16 recipientChain,bytes32 recipient,uint256 arbiterFee,uint32 nonce)",
  ],
  inputDataFnName: "transferTokens",
};

const nativeDepositInputDataExtraction = {
  inputDataABI: [
    "function wrapAndTransferETH(uint16 recipientChain,bytes32 recipient,uint256 arbiterFee,uint32 nonce)",
  ],
  inputDataFnName: "wrapAndTransferETH",
};

const portalNativeAndWrappedTransfersFromHashes = async (
  chain: Chain,
  hashes: string[],
  address: string,
  nativeToken: string
) => {
  const provider = getProvider(chain) as any;
  const transactions = (
    await Promise.all(
      hashes.map(async (hash) => {
        // TODO: add timeout
        const tx = await provider.getTransaction(hash);
        const receipt = await provider.getTransactionReceipt(hash);
        if (!tx) {
          console.error(`WARNING: Unable to get transaction data on chain ${chain}, SKIPPING tx.`);
          return;
        }
        if (!receipt) {
          console.error(`WARNING: Unable to get transaction data on chain ${chain}, SKIPPING tx.`);
          return;
        }
        const functionSignature = tx.data.slice(0, 8);
        let isDeposit, token, value;
        let { blockNumber, from, to } = tx;
        // ***NATIVE TOKENS***
        // if it is a deposit, can directly get all needed info from tx
        if (functionSignature === "0x998150") {
          if (!(address === from || address === to)) {
            console.error(
              `WARNING: Address given for native transfer on chain ${chain} not present in tx, SKIPPING tx.`
            );
            return;
          }
          token = nativeToken;
          value = tx.value;
          isDeposit = true;
        }
        // if it is a withdrawal, attempts to get total amount of WETH sent to contract for withdrawal
        else if (functionSignature === "0xff200c") {
          const logs = receipt.logs;
          const filteredLogs = logs.filter((log: any) => {
            const topics = log.topics;
            const address = log.address;
            let isTransfer = false;
            topics.map((topic: string) => {
              if (topic.slice(0, 8) === "0x7fcf53" && address === nativeToken) {
                // this is sig for WETH withdrawal fn
                isTransfer = true;
              }
            });
            return isTransfer;
          });
          if (filteredLogs.length === 0) {
            // console.error(`Warning: Transaction receipt on chain ${chain} contained no token transfers, SKIPPING tx.`);
            return;
          } else {
            let bnAmountSum = ethers.BigNumber.from(0);
            for (const log of filteredLogs) {
              const value = ethers.BigNumber.from(log.data);
              bnAmountSum = bnAmountSum.add(value);
            }
            token = nativeToken;
            value = bnAmountSum;
            isDeposit = false;
            // switch "from" and "to" when it is a withdrawal
            const a = from;
            from = to;
            to = a;
          }
        }
        // ***WRAPPED TOKENS***
        // if it is a deposit, it is already caught by 'depositEventParams'
        // if it is a withdrawal, attempt to get the token minted from tx receipt
        else if (functionSignature === "0xc68785") {
          const logs = receipt.logs;
          const filteredLogs = logs.filter((log: any) => {
            const topics = log.topics;
            let isTransfer = false;
            topics.map((topic: string) => {
              if (topic.slice(0, 8) === "0xddf252") {
                isTransfer = true;
              }
            });
            return isTransfer;
          });
          if (filteredLogs.length === 0) {
            // console.error(`Warning: Transaction receipt on chain ${chain} contained no token transfers, SKIPPING tx.`);
          } else {
            const firstLog = filteredLogs[0];
            const address = firstLog.address;
            let bnAmount = ethers.BigNumber.from(0);
            for (const log of filteredLogs) {
              if (address === log.address) {
                bnAmount = bnAmount.add(ethers.BigNumber.from(log.data))
              }
            }
            token = address;
            value = bnAmount;
            isDeposit = false;
          }
          if (filteredLogs.length > 1) {
            // console.error(`Warning: Transaction receipt on chain ${chain} contained multiple token transfers.`);
          }
          // switch "from" and "to" when it is a withdrawal
          const a = from;
          from = to;
          to = a;
        }
        // this could be a deposit tx already covered, or a reverted tx
        if (!token) {
          return null;
        }

        return {
          blockNumber: blockNumber,
          txHash: hash,
          from: from,
          to: to,
          token: token,
          amount: value,
          isDeposit: isDeposit,
        } as EventData;
      })
    )
  ).filter((tx) => tx) as EventData[];
  return transactions;
};

// checks deposits for Solana as receipient chain, withdrawals for Solana as source chain and returns only those txs
// the 'wormhole chain id' for Solana is 1
const processLogsForSolana = async (logs: EventData[], chain: Chain) => {
  const provider = getProvider(chain) as any;
  const solanaLogs = await Promise.all(
    logs.map(async (log) => {
      const { txHash, isDeposit } = log;
      const tx = await provider.getTransaction(txHash);
      const data = tx.data as string;

      let override = false;
      if (isDeposit) {
        if (data.slice(0, 10) === "0x0f5287b0") {
          const iface = new ethers.utils.Interface(depositInputDataExtraction.inputDataABI);
          const inputData = iface.decodeFunctionData(depositInputDataExtraction.inputDataFnName || "", data);
          if (inputData.recipientChain === 1) {
            override = true;
          }
        } else if (data.slice(0, 10) === "0x9981509f") {
          const iface = new ethers.utils.Interface(nativeDepositInputDataExtraction.inputDataABI);
          const inputData = iface.decodeFunctionData(nativeDepositInputDataExtraction.inputDataFnName || "", data);
          if (inputData.recipientChain === 1) {
            override = true;
          }
        }
      } else {
        if (data.slice(0, 10) === "0xc6878519" || data.slice(0, 10) === "0xff200cde") {
          const from = tx.from;
          const index = data.indexOf(from.slice(2).toLowerCase());
          const chainID = data.slice(index + 40, index + 44); // this is a hack because I couldn't figure out how to decode the input data
          if (parseInt(chainID) === 1) {
            override = true;
          }
        }
      }
      if (override) {
        return { ...log, isDeposit: !log.isDeposit, chainOverride: "solana" };
      }
      return null;
    })
  );
  return solanaLogs.filter((log) => log) as EventData[];
};

const constructParams = (chain: string) => {
  let eventParams = [] as any;
  const chainAddresses = contractAddresses[chain];
  const address = chainAddresses.tokenBridge;
  const nativeToken = chainAddresses.nativeToken;
  const depositEventParams: PartialContractEventParams = constructTransferParams(address, true);
  const withdrawalEventParams: PartialContractEventParams = constructTransferParams(address, false, {
    excludeTo: ["0x0000000000000000000000000000000000000000"],
  });
  eventParams.push(depositEventParams, withdrawalEventParams);

  return async (fromBlock: number, toBlock: number) => {
    const eventLogData = await getTxDataFromEVMEventLogs("portal", chain as Chain, fromBlock, toBlock, eventParams);

    // for native token transfers, only able to get from subgraph, Etherscan API, etc.
    // skipped for chains without available API
    let nativeTokenData = [] as EventData[];
    if (["ethereum", "polygon", "fantom", "avalanche", "bsc", "aurora", "celo"].includes(chain)) {
      if (!nativeToken) {
        throw new Error(`Chain ${chain} is missing native token address.`);
      }
      await etherscanWait();
      const txs = await getTxsBlockRangeEtherscan(chain, address, fromBlock, toBlock, {
        includeSignatures: nativeAndWrappedTokenTransferSignatures,
      });
      if (txs.length) {
        const hashes = txs.map((tx: any) => tx.hash);
        const nativeTokenTransfers = await portalNativeAndWrappedTransfersFromHashes(
          chain as Chain,
          hashes,
          address,
          nativeToken
        );
        nativeTokenData = [...nativeTokenTransfers, ...nativeTokenData];
      }
    }

    // every chain also checks for and inserts logs for solana txs
    const solanaLogs = await processLogsForSolana([...eventLogData, ...nativeTokenData], chain as Chain);

    return [...eventLogData, ...nativeTokenData, ...solanaLogs];
  };
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  fantom: constructParams("fantom"),
  avalanche: constructParams("avax"),
  bsc: constructParams("bsc"),
  aurora: constructParams("aurora"),
  celo: constructParams("celo"),
  //klaytn: constructParams("klaytn"),
};

export default adapter;
