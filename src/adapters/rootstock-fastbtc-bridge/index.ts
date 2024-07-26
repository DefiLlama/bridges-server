import { BridgeAdapter, ContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const bridge = "0x1a8e78b41bc5ab9ebb6996136622b9b41a601b5c";
const rbtc = "0x542fDA317318eBF1d3DEAf76E0b632741A7e677d";

const outFlowEventParams: ContractEventParams = {
  target: bridge,
  topic: "NewBitcoinTransfer(bytes32,string,uint256,uint256,uint256,address)",
  abi: ["event NewBitcoinTransfer(bytes32 indexed transferId, string btcAddress, uint256 nonce, uint256 amountSatoshi, uint256 feeSatoshi, address indexed rskAddress)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  fixedEventData: {
    from: bridge,
    token: rbtc,
  },
  argKeys: {
    to: "btcAddress",
    amount: "amountSatoshi",
  },
  isDeposit: false,
};

const constructParams = () => {
  const eventParams = [outFlowEventParams];
  return async (fromBlock: number, toBlock: number) => {
    const logs = await getTxDataFromEVMEventLogs("fastbtc", "rsk", fromBlock, toBlock, eventParams);
    const results = logs.map((log) => ({ ...log, amount: log?.amount?.mul(1e10) }));
    return results;
  };
};

const adapter: BridgeAdapter = {
    rootstock: constructParams(),
};

export default adapter;
