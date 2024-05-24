import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { BigNumber, ethers } from "ethers";
import { getProvider } from "../../utils/provider";

const contractAddresses = {
  bsc: {
    bridge: [
      "0x51187757342914E7d94FFFD95cCCa4f440FE0E06"
    ],
    nativeToken: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    nativeTokenPoolId: 10
  }
} as {
  [chain: string]: {
    bridge: string[];
    nativeToken?: string;
    nativeTokenPoolId?: number
  };
};

const depositParams: PartialContractEventParams = {
  target: "",
  topic: "TransferToken(uint64,uint16,uint256,address,address,uint256)",
  abi: ["event TransferToken(uint64 indexed sequence, uint16 indexed dstChainId, uint256 indexed poolId, address sender, address recipient, uint256 amount)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash"
  },
  argKeys: {
    from: "sender"
  },
  isDeposit: true
};

const withdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "ReceiveToken(uint64,uint16,uint256,address,uint256)",
  abi: ["event ReceiveToken(uint64 indexed sequence, uint16 indexed srcChainId, uint256 indexed poolId, address recipient, uint256 amount)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash"
  },
  argKeys: {
    to: "recipient"
  },
  isDeposit: false
};

const constructParams = (chain: string) => {
  let eventParams = [] as any;
  const bridges = contractAddresses[chain].bridge;
  const nativeToken = contractAddresses[chain].nativeToken;
  const nativeTokenPoolId = contractAddresses[chain].nativeTokenPoolId;
  for (let address of bridges) {
    const finalDepositParams = {
      ...depositParams,
      target: address,
      fixedEventData: {
        to: address
      }
    };

    const finalWithdrawalParams = {
      ...withdrawalParams,
      target: address,
      fixedEventData: {
        from: address
      }
    };
    eventParams.push(finalDepositParams, finalWithdrawalParams);
  }

  return async (fromBlock: number, toBlock: number) => {
    let eventLogDatas = await getTxDataFromEVMEventLogs("zkbridge", chain as Chain, fromBlock, toBlock, eventParams);
    let i = 0;
    for (let eventLogData of eventLogDatas) {
      const provider = getProvider(chain) as any;
      const txReceipt = await provider.getTransactionReceipt(eventLogData.txHash);
      for (let log of txReceipt.logs) {
        if (log.topics[0].slice(0, 8) === "0x302b3e" || log.topics[0].slice(0, 8) === "0xe0442d") {
          if (ethers.BigNumber.from(log.topics[3]).eq(BigNumber.from(nativeTokenPoolId))) {// native token
            // @ts-ignore
            eventLogDatas[i].token = nativeToken;
            if (eventLogDatas[i].isDeposit) {
              eventLogDatas[i].amount = ethers.BigNumber.from("0x" + log.data.slice(130, 194));
            } else {
              eventLogDatas[i].amount = ethers.BigNumber.from("0x" + log.data.slice(66, 130));
            }
          } else { // erc20 token
            for (let log of txReceipt.logs) {
              if (log.topics[0] === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef") {
                eventLogDatas[i].token = log.address;
                eventLogDatas[i].amount = ethers.BigNumber.from(log.data);
                break;
              }
            }
          }
          break;
        }
      }
      i++;
    }
    return eventLogDatas;
  };
};

const adapter: BridgeAdapter = {
  bsc: constructParams("bsc")
};

export default adapter;
