import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { getTxsBlockRangeEtherscan, getLock } from "../../helpers/etherscan";
import { EventData } from "../../utils/types";
import { getProvider } from "@defillama/sdk/build/general";
import { ethers } from "ethers";
import { PromisePool } from "@supercharge/promise-pool";

// Wormhole: Portal core and token bridge contract addresses
// https://docs.wormhole.com/wormhole/blockchain-environments/environments
const contractAddresses = {
  ethereum: {
    tokenBridge: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
    coreBridge: "0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B",
  },
  polygon: {
    tokenBridge: "0x5a58505a96D1dbf8dF91cB21B54419FC36e93fdE",
    coreBridge: "0x7A4B5a56256163F07b2C80A7cA55aBE66c4ec4d7",
  },
  fantom: {
    tokenBridge: "0x7C9Fc5741288cDFdD83CeB07f3ea7e22618D79D2",
    coreBridge: "0x126783A6Cb203a3E35344528B26ca3a0489a1485",
  },
  avax: {
    tokenBridge: "0x0e082F06FF657D94310cB8cE8B0D9a04541d8052",
    coreBridge: "0x54a8e5f9c4CbA08F9943965859F6c34eAF03E26c",
  },
  bsc: {
    tokenBridge: "0xB6F6D86a8f9879A9c87f643768d9efc38c1Da6E7",
    coreBridge: "0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B",
  },
  aurora: {
    tokenBridge: "0x51b5123a7b0F9b2bA265f9c4C8de7D78D52f510F",
    coreBridge: "0xa321448d90d4e5b0A732867c18eA198e75CAC48E",
  },
  celo: {
    tokenBridge: "0x796Dff6D74F3E27060B71255Fe517BFb23C93eed",
    coreBridge: "0xa321448d90d4e5b0A732867c18eA198e75CAC48E",
  },
  klaytn: {
    tokenBridge: "0x5b08ac39EAED75c0439FC750d9FE7E1F9dD0193F",
    coreBridge: "0x0C21603c4f3a6387e241c0091A7EA39E43E90bb7",
  },
  moonbeam: {
    tokenBridge: "0xb1731c586ca89a23809861c6103f0b96b3f57d92",
    coreBridge: "0xC8e2b0cD52Cf01b0Ce87d389Daa3d414d4cE29f3",
  },
  optimism: {
    tokenBridge: "0x1D68124e65faFC907325e3EDbF8c4d84499DAa8b",
    coreBridge: "0xEe91C335eab126dF5fDB3797EA9d6aD93aeC9722",
  },
  arbitrum: {
    tokenBridge: "0x0b2402144Bb366A632D14B83F244D2e0e21bD39c",
    coreBridge: "0xa5f208e072434bC67592E4C49C1B991BA79BCA46",
  },
  base: {
    tokenBridge: "0x8d2de8d2f73F1F4cAB472AC9A881C9b123C79627",
    coreBridge: "0xbebdb6C8ddC678FfA9f8748f85C815C556Dd8ac6",
  },
} as {
  [chain: string]: {
    tokenBridge: string;
    coreBridge: string;
  };
};

const completeTransferSigs = [
  ethers.utils.id("completeTransferAndUnwrapETH(bytes)"),
  ethers.utils.id("completeTransferAndUnwrapETHWithPayload(bytes)"),
  ethers.utils.id("completeTransfer(bytes)"),
  ethers.utils.id("completeTransferWithPayload(bytes)"),
].map((s) => s.slice(0, 8));

const logMessagePublishedAbi =
  "event LogMessagePublished(address indexed sender, uint64 sequence, uint32 nonce, bytes payload, uint8 consistencyLevel)";
const logMessagePublishedIface = new ethers.utils.Interface([logMessagePublishedAbi]);
const approvalIface = new ethers.utils.Interface([
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
]);
const transferIface = new ethers.utils.Interface([
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]);
const depositIface = new ethers.utils.Interface(["event Deposit(address indexed dst, uint256 wad)"]);
const withdrawalIface = new ethers.utils.Interface(["event Withdrawal(address indexed src, uint256 wad)"]);

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

const tryParseLog = (log: ethers.providers.Log, parser: ethers.utils.Interface) => {
  if (!log) return null;
  try {
    return parser.parseLog(log);
  } catch {
    return null;
  }
};

const portalNativeAndWrappedTransfersFromHashes = async (chain: Chain, hashes: string[], tokenBridge: string) => {
  const provider = getProvider(chain);

  const { results, errors } = await PromisePool.withConcurrency(20)
    .for(hashes)
    .process(async (hash) => {
      // TODO: add timeout
      const tx = await provider.getTransaction(hash);
      const receipt = await provider.getTransactionReceipt(hash);
      if (!tx || !tx.blockNumber || !receipt) {
        console.error(`WARNING: Unable to get transaction data on chain ${chain}, SKIPPING tx.`);
        return;
      }
      // make sure that the logs are sorted in ascending order
      const logs = receipt.logs.sort((a, b) => a.logIndex - b.logIndex);
      const results = logs.reduce((results, log, i) => {
        let amount: ethers.BigNumber | undefined;
        // for deposits there will be a `LogMessagePublished` event
        const logMessagePublished = tryParseLog(log, logMessagePublishedIface);
        if (logMessagePublished) {
          const payload = Buffer.from(logMessagePublished.args.payload.slice(2), "hex");
          // only care about token transfer message types (payload ID = 1 or 3)
          const payloadID = payload.readUint8(0);
          if (!(payloadID === 1 || payloadID === 3)) {
            return results;
          }
          // the `Transfer` event will precede the `LogMessagePublished` event
          // some token implementations may also emit an `Approval` event
          // See https://docs.openzeppelin.com/contracts/2.x/api/token/erc20#ERC20-transferFrom-address-address-uint256-
          let previousLog = logs[i - 1];
          if (tryParseLog(previousLog, approvalIface)) {
            previousLog = logs[i - 2];
          }
          const transfer = tryParseLog(previousLog, transferIface);
          // lock or burn
          let to = "";
          let isDeposit = true;
          if (transfer && (transfer.args.to === tokenBridge || transfer.args.to === ethers.constants.AddressZero)) {
            amount = transfer.args.value;
            to = transfer.args.to;
            if (to === ethers.constants.AddressZero) {
              // if this is a wrapped token being burned and not being sent to its origin chain,
              // then it should be included in the volume by fixing the to address
              // https://docs.wormhole.com/wormhole/explore-wormhole/vaa#token-transfer
              const originChain = payload.readUint16BE(65);
              const toChain = payload.readUInt16BE(99);
              if (toChain !== originChain) {
                to = tokenBridge;
                isDeposit = false;
              }
            }
          } else {
            const deposit = tryParseLog(previousLog, depositIface);
            // lock
            if (deposit && deposit.args.dst === tokenBridge) {
              amount = deposit.args.wad;
              to = deposit.args.dst;
            }
          }
          if (amount) {
            results.push({
              blockNumber: tx.blockNumber!,
              txHash: hash,
              from: tx.from,
              to,
              token: previousLog.address,
              amount,
              isDeposit,
            });
            return results;
          }
        }
        // TODO: change this if the token bridge is upgraded to emit a `TransferRedeemed` event
        const functionSignature = tx.data.slice(0, 8);
        if (completeTransferSigs.includes(functionSignature)) {
          const transfer = tryParseLog(log, transferIface);
          // unlock or mint
          let from = "";
          if (transfer && (transfer.args.from === tokenBridge || transfer.args.from === ethers.constants.AddressZero)) {
            amount = transfer.args.value;
            from = transfer.args.from;
          } else {
            const withdrawal = tryParseLog(log, withdrawalIface);
            // unlock
            if (withdrawal && withdrawal.args.src === tokenBridge) {
              amount = withdrawal.args.wad;
              from = withdrawal.args.src;
            }
          }
          if (amount) {
            results.push({
              blockNumber: tx.blockNumber!,
              txHash: hash,
              // TODO: not sure how to get the token recipient when the tx sender isn't the recipient
              // (e.g. contract controlled transfers)
              to: transfer?.args.to || tx.from,
              from,
              token: log.address,
              amount,
              isDeposit: false,
            });
            return results;
          }
        }
        return results;
      }, [] as EventData[]);
      return results;
    });
  if (errors.length > 0) {
    console.error("Errors in Portal's portalNativeAndWrappedTransfersFromHashes", errors);
  }
  // aggregate transfers where the token, to, and from values match
  const aggregated = results.reduce<EventData[]>((aggregated, events) => {
    if (events) {
      events.forEach((event) => {
        const { txHash, token, from, to, amount } = event;
        const other = aggregated.find(
          (e) => e.txHash === txHash && e.token === token && e.to === to && e.from === from
        );
        if (other) {
          other.amount.add(amount);
        } else {
          aggregated.push(event);
        }
      });
    }
    return aggregated;
  }, []);
  return aggregated;
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
      const functionSignature = data.slice(0, 10);

      let override = false;
      if (isDeposit) {
        if (functionSignature === "0x0f5287b0") {
          const iface = new ethers.utils.Interface(depositInputDataExtraction.inputDataABI);
          const inputData = iface.decodeFunctionData(depositInputDataExtraction.inputDataFnName || "", data);
          if (inputData.recipientChain === 1) {
            override = true;
          }
        } else if (functionSignature === "0x9981509f") {
          const iface = new ethers.utils.Interface(nativeDepositInputDataExtraction.inputDataABI);
          const inputData = iface.decodeFunctionData(nativeDepositInputDataExtraction.inputDataFnName || "", data);
          if (inputData.recipientChain === 1) {
            override = true;
          }
        }
      } else if (functionSignature === "0xc6878519" || functionSignature === "0xff200cde") {
        const from = tx.from;
        const index = data.indexOf(from.slice(2).toLowerCase());
        const chainID = data.slice(index + 40, index + 44); // this is a hack because I couldn't figure out how to decode the input data
        // ***THIS DOESN'T WORK BECAUSE chainID IS THE DESTINATION CHAIN, I THINK NO WAY TO GET SOURCE CHAIN
        if (parseInt(chainID) === 1) {
          override = true;
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
  const { coreBridge, tokenBridge } = contractAddresses[chain];
  // The token bridge doesn't emit events on deposits/outbound token transfers,
  // but it calls the core bridge which emits a `LogMessagePublished` event
  const logMessagePublishedTopic = logMessagePublishedIface.getEventTopic("LogMessagePublished");
  const logMessagePublishedEventParams: PartialContractEventParams = {
    target: coreBridge,
    topic: logMessagePublishedTopic,
    topics: [logMessagePublishedTopic, ethers.utils.hexZeroPad(tokenBridge, 32)],
    abi: [logMessagePublishedAbi],
    isDeposit: true,
  };

  return async (fromBlock: number, toBlock: number) => {
    const events = await getTxDataFromEVMEventLogs("portal", chain as Chain, fromBlock, toBlock, [
      logMessagePublishedEventParams,
    ]);
    let hashes = events.map((e) => e.txHash);
    // The token bridge doesn't emit events on withdrawals/inbound token transfers,
    // only able to get from subgraph, Etherscan API, etc.
    // skipped for chains without available API
    // TODO: change this when the token bridge emits the `TransferRedeemed` event
    if (chain !== "klaytn" && chain !== "base" && chain !== "moonbeam") {
      await getLock();
      const txs = await getTxsBlockRangeEtherscan(chain, tokenBridge, fromBlock, toBlock, {
        includeSignatures: completeTransferSigs,
      });
      if (txs.length) {
        hashes = [...hashes, ...txs.map((tx: any) => tx.hash)];
      }
    }

    // every chain also checks for and inserts logs for solana txs
    // const solanaLogs = await processLogsForSolana([...eventLogData, ...nativeTokenData], chain as Chain);

    const transfers = await portalNativeAndWrappedTransfersFromHashes(chain, hashes, tokenBridge);
    // console.log(`transfers: ${JSON.stringify(transfers, null, 2)}`);
    return transfers;
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
  klaytn: constructParams("klaytn"),
  moonbeam: constructParams("moonbeam"),
  optimism: constructParams("optimism"),
  arbitrum: constructParams("arbitrum"),
  base: constructParams("base"),
};

export default adapter;
