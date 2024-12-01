import { BridgeAdapter, ContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { EventData } from "../../utils/types";

const bridge = "0x5e4861a80B55f035D899f66772117F00FA0E8e7B";
const tbtc = "0x18084fbA666a33d37592fA2633fD49a74DD93a88";
const tbtcVault = "0x9c070027cdc9dc8f82416b2e5314e11dfb4fe3cd"

export type ExtendedContractEventParams = ContractEventParams & {
  extraData?: { [key: string]: any };
};

const mintedEventParams: ContractEventParams = {
  target: tbtcVault,
  topic: "Minted(address,uint256)",
  abi: ["event Minted(address indexed to, uint256 amount)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  fixedEventData: {
    token: tbtc,
    from: bridge,
  },
  argKeys: {
    to: "to",
    amount: "amount",
  },
  isDeposit: true,
};

const redeemEventParams: ContractEventParams = {
  target: tbtcVault,
  topic: "Unminted(address,uint256)",
  abi: ["event Unminted(address indexed from, uint256 amount)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  fixedEventData: {
    token: tbtc,
    to: "",
  },
  argKeys: {
    from: "from",
    amount: "amount",
  },
  isDeposit: false,
};

const constructParams = (chain: string) => {
  const eventParams = [mintedEventParams, redeemEventParams];
  return async (fromBlock: number, toBlock: number) => {
    const evmEventLogs = await getTxDataFromEVMEventLogs("thresholdnetwork", chain, fromBlock, toBlock, eventParams);

    const mintAndRedeemEventLogs: EventData[] = []
    evmEventLogs.forEach((eventLog) => {
      if (eventLog.isDeposit) {
        !eventLog.amount.eq(0) && mintAndRedeemEventLogs.push(eventLog);
      } else {
        mintAndRedeemEventLogs.push(eventLog);
      }
    });

    return mintAndRedeemEventLogs;
  }
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
};

export default adapter;
