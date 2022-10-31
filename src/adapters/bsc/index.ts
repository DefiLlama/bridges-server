import {
  BridgeAdapter,
  PartialContractEventParams,
} from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";
import { ethers } from "ethers";

const nullAddress = "0x0000000000000000000000000000000000000000"

/*
https://www.bscscan.com/token/0x55d398326f99059ff775485246999027b3197955?a=0x0000000000000000000000000000000000000000
0xe9e7cea3dedca5984780bafc599bd69add087d56
*/

const usdtMintParams: PartialContractEventParams = {
  target: "0x55d398326f99059fF775485246999027B3197955",
  topic: "Transfer(address,address,uint256)",
  topics: [ethers.utils.id("Transfer(address,address,uint256)"), ethers.utils.hexZeroPad(nullAddress, 32)],
  abi: ["event Transfer(address indexed from, address indexed to, uint256 value)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
    token: "address",
  },
  argKeys: {
    from: "from",
    to: "to",
    amount: "value",
  },
  isDeposit: false,
};

const usdtBurnParams: PartialContractEventParams = {
  target: "0x55d398326f99059fF775485246999027B3197955",
  topic: "Transfer(address,address,uint256)",
  topics: [ethers.utils.id("Transfer(address,address,uint256)"), null, ethers.utils.hexZeroPad(nullAddress, 32)],
  abi: ["event Transfer(address indexed from, address indexed to, uint256 value)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
    token: "address",
  },
  argKeys: {
    from: "from",
    to: "to",
    amount: "value",
  },
  isDeposit: true,
};

/*
  const topic = "Transfer(address,address,uint256)";
  const logKeys = {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
    token: "address",
  };
  const argKeys = {
    from: "from",
    to: "to",
    amount: "value",
  };
  const abi = ["event Transfer(address indexed from, address indexed to, uint256 value)"];
  let topics = [];
  if (isDeposit) {
    topics = [ethers.utils.id("Transfer(address,address,uint256)"), null, ethers.utils.hexZeroPad(target, 32)];
  } else {
    topics = [ethers.utils.id("Transfer(address,address,uint256)"), ethers.utils.hexZeroPad(target, 32)];
  }
  target = null as any;
*/

const contractAddresses = {
} as any // fix


const constructParams = () => {
  let eventParams = [] as any
  eventParams.push()
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("bsc", "bsc", fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  bsc: constructParams(),
};

export default adapter;
