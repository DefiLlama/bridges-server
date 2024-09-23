import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { getProvider } from "../../utils/provider";
import zkbridgeContractes from "./contants";
import { ethers } from "ethers";

const depositParams: PartialContractEventParams = {
  target: "",
  topic: "TransferToken(uint64,uint16,uint256,address,address,uint256)",
  abi: [
    "event TransferToken(uint64 indexed sequence, uint16 indexed dstChainId, uint256 indexed poolId, address sender, address recipient, uint256 amount)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "sender",
    to: "recipient",
    amount: "amount",
  },
  isDeposit: true,
};

const withdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "ReceiveToken(uint64,uint16,uint256,address,uint256)",
  abi: [
    "event ReceiveToken(uint64 indexed sequence, uint16 indexed srcChainId, uint256 indexed poolId, address recipient, uint256 amount)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    to: "recipient",
    amount: "amount",
  },
  isDeposit: false,
};

const wait = (ms: number) =>
  new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve("");
    }, ms);
  });

const newConstructParams = (chain: string) => {
  let eventParams = [] as any;
  const bridges = zkbridgeContractes[chain];
  if (!bridges) {
    return;
  }
  Object.entries(bridges).map(([address, _]) => {
    const finalDepositParams = {
      ...depositParams,
      target: address,
      fixedEventData: {
        to: address,
      },
    };
    const finalWithdrawalParams = {
      ...withdrawalParams,
      target: address,
      fixedEventData: {
        from: address,
      },
    };
    eventParams.push(finalDepositParams, finalWithdrawalParams);
  });

  return async (fromBlock: number, toBlock: number) => {
    let eventLogDatas = await getTxDataFromEVMEventLogs("zkbridge", chain as Chain, fromBlock, toBlock, eventParams);
    let res = [];
    let j = 0;
    for (let eventLogData of eventLogDatas) {
      const provider = getProvider(chain) as any;
      let txReceipt;
      for (let i = 0; i < 5; i++) {
        txReceipt = await provider.getTransactionReceipt(eventLogData.txHash);
        if (txReceipt) {
          break;
        }
        await wait(500);
      }
      if (!txReceipt) {
        break;
      }
      let contractAddr;
      if (eventLogData.isDeposit) {
        contractAddr = eventLogData.to;
      } else {
        contractAddr = eventLogData.from;
      }
      let bridge = bridges[contractAddr];

      for (let log of txReceipt.logs) {
        if (log.topics[0].slice(0, 8) === "0x302b3e" || log.topics[0].slice(0, 8) === "0xe0442d") {
          let poolId = ethers.BigNumber.from(log.topics[3]);
          let poolInfo = bridge[poolId.toNumber()];
          if (!poolInfo) {
            continue;
          }
          if (poolInfo.isNativeToken) {
            // native token
            // @ts-ignore
            eventLogData.token = poolInfo.nativeToken;
            if (eventLogData.isDeposit) {
              eventLogData.amount = ethers.BigNumber.from("0x" + log.data.slice(130, 194));
            } else {
              eventLogData.amount = ethers.BigNumber.from("0x" + log.data.slice(66, 130));
            }
          } else {
            // erc20 token
            for (let log of txReceipt.logs) {
              if (log.topics[0].slice(0, 8) === "0xddf252") {
                eventLogData.token = log.address;
                eventLogData.amount = ethers.BigNumber.from(log.data);
                break;
              }
            }
          }
          break;
        }
      }
      res[j] = eventLogData;
      j++;
    }
    return res;
  };
};

const adapter = {
  ethereum: newConstructParams("ethereum"),
  bsc: newConstructParams("bsc"),
  polygon: newConstructParams("polygon"),
  optimism: newConstructParams("optimism"),
  arbitrum: newConstructParams("arbitrum"),
  linea: newConstructParams("linea"),
  mantle: newConstructParams("mantle"),
  base: newConstructParams("base"),
  scroll: newConstructParams("scroll"),
  opbnb: newConstructParams("op_bnb"),
  combo: newConstructParams("combo-mainnet"),
  bouncebit: newConstructParams("bouncebit-mainnet"),
  bitlayer: newConstructParams("btr"),
};

export default adapter;
