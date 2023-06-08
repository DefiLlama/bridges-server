import { BridgeAdapter, ContractEventParams, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { ethers } from "ethers";

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const BRIDGES_ADDRESS = "0x2a3DD3EB832aF982ec71669E178424b10Dca2EDe";
const etherDepositEventParams: ContractEventParams = {
  target: BRIDGES_ADDRESS,
  topic: "BridgeEvent(uint8,uint32,address,uint32,address,uint256,bytes,uint32)",
  abi: [
    `event BridgeEvent(uint8 leafType, uint32 originNetwork, address originAddress, uint32 destinationNetwork, address destinationAddress, uint256 amount, bytes metadata, uint32 depositCount)`,
  ],
  argKeys: {
    from: "destinationAddress",
    amount: "amount",
    token: "originAddress",
  },
  isDeposit: true,
};

const etherWithdrawEventParams: ContractEventParams = {
  target: BRIDGES_ADDRESS,
  topic: "ClaimEvent(uint32,uint32,address,address,uint256)",
  abi: [
    `event ClaimEvent(uint32 index, uint32 originNetwork, address originAddress, address destinationAddress, uint256 amount)`,
  ],
  argKeys: {
    to: "destinationAddress",
    amount: "amount",
    token: "originAddress",
  },
  fixedEventData: {
    from: BRIDGES_ADDRESS,
  },
  isDeposit: false,
};

const constructParams = () => {
  const eventParams = [etherDepositEventParams, etherWithdrawEventParams];
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("polygonzk", "ethereum", fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams(),
};

export default adapter;
