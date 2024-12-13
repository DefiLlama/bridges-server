import { BigNumber, ethers } from "ethers";
import { BridgeAdapter, ContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const flyoverContract = "0xAA9cAf1e3967600578727F975F283446A3Da6612";
const rbtc = "0x542fDA317318eBF1d3DEAf76E0b632741A7e677d";

const depositPegoutEventParams: ContractEventParams = {
  target: flyoverContract,
  topic: "PegOutDeposit(bytes32,address,uint256,uint256)",
  abi: ["event PegOutDeposit(bytes32 indexed quoteHash, address indexed sender, uint256 amount, uint256 timestamp)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  fixedEventData: {    
    token: rbtc,
    to: flyoverContract,
  },
  argKeys: {    
    amount: "amount",
    from: "sender",
  },
  isDeposit: false,
};

const callForUserEventParams: ContractEventParams = {
    target: flyoverContract,
    topic: "CallForUser(address,address,uint256,uint256,bytes,bool,bytes32)",
    abi: ["event CallForUser(address indexed from, address indexed dest, uint256 gasLimit, uint256 value, bytes data, bool success, bytes32 quoteHash)"],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    fixedEventData: {      
      token: rbtc,
      from: flyoverContract,
    },
    argKeys: {      
      amount: "value",      
      to: "dest",
    },
    isDeposit: true,
  };

const constructParams = () => {
  const eventParams = [depositPegoutEventParams, callForUserEventParams];
  return async (fromBlock: number, toBlock: number) => {    
    const logs = await getTxDataFromEVMEventLogs("flyover", "rsk", fromBlock, toBlock, eventParams);
    return logs;
  };
};

const adapter: BridgeAdapter = {
    rootstock: constructParams(),
};

export default adapter;
