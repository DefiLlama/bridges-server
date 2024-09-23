import { BigNumber, ethers } from "ethers";
import { BridgeAdapter, ContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const bridgeOutFlow = "0x1a8e78b41bc5ab9ebb6996136622b9b41a601b5c";
const bridgeInFlow = "0xe43cafbdd6674df708ce9dff8762af356c2b454d";
const rbtc = "0x542fDA317318eBF1d3DEAf76E0b632741A7e677d";

const outFlowEventParams: ContractEventParams = {
  target: bridgeOutFlow,
  topic: "NewBitcoinTransfer(bytes32,string,uint256,uint256,uint256,address)",
  abi: ["event NewBitcoinTransfer(bytes32 indexed transferId, string btcAddress, uint256 nonce, uint256 amountSatoshi, uint256 feeSatoshi, address indexed rskAddress)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  fixedEventData: {
    from: bridgeOutFlow,
    token: rbtc,
  },
  argKeys: {
    to: "btcAddress",
    amount: "amountSatoshi",
  },
  isDeposit: false,
};

const inFlowEventParams: ContractEventParams = {
    target: bridgeInFlow,
    topic: "NewBitcoinTransferIncoming(address,uint256,uint256,bytes32,uint256)",
    topics: ["0x20ef15fb02bd69f212d7a84358d8a7c05b65d25bbb920b11c4d32f837118e441"],
    abi: ["event NewBitcoinTransferIncoming(address indexed rskAddress, uint256 amountWei, uint256 feeWei, bytes32 btcTxHash, uint256 btcTxVout)"],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    fixedEventData: {
      from: bridgeInFlow,
      token: rbtc,
    },
    argKeys: {
      to: "rskAddress",
      amount: "amountWei",
    },
    isDeposit: true,
};

const constructParams = () => {
  const eventParams = [outFlowEventParams, inFlowEventParams];
  return async (fromBlock: number, toBlock: number) => {    
    const logs = await getTxDataFromEVMEventLogs("fastbtc", "rsk", fromBlock, toBlock, eventParams);

    logs.forEach((log) => {
        if (!log.isDeposit) {
            log.amount = log?.amount?.mul(1e10)
        }
      });

      return logs;
  };
};

const adapter: BridgeAdapter = {
    rootstock: constructParams(),
};

export default adapter;
