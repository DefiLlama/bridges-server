import { BridgeAdapter, PartialContractEventParams } from "../../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../../helpers/processTransactions";

const FXRP = "0xAd552A648C74D49E10027AB8a618A3ad4901c5bE";
const ZERO = "0x0000000000000000000000000000000000000000";

const transferAbi = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

const depositMintParams: PartialContractEventParams = {
  target: FXRP,
  topic: "Transfer(address,address,uint256)",
  abi: transferAbi,
  isDeposit: true,
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
  filter: {
    includeFrom: [ZERO],
  },
};

const withdrawBurnParams: PartialContractEventParams = {
  target: FXRP,
  topic: "Transfer(address,address,uint256)",
  abi: transferAbi,
  isDeposit: false,
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
  filter: {
    includeTo: [ZERO],
  },
};

const constructParams = () => {
  const eventParams = [depositMintParams, withdrawBurnParams];
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("fxrp", "flare", fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  flare: constructParams(),
};

export default adapter;