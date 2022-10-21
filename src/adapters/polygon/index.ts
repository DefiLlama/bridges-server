import {
  BridgeAdapter,
  ContractEventParams,
  PartialContractEventParams,
} from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";

// 0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf is Polygon (Matic): ERC20 Bridge
// 0x8484Ef722627bf18ca5Ae6BcF031c23E6e922B30 is Polygon (Matic): Ether Bridge

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

const ercDepositEventParams: ContractEventParams = {
  target: "0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf",
  topic: "LockedERC20(address,address,address,uint256)",
  abi: [
    "event LockedERC20(address indexed depositor, address indexed depositReceiver, address indexed rootToken, uint256 amount)",
  ],
  argKeys: {
    token: "rootToken",
    from: "depositor",
    amount: "amount",
  },
  isDeposit: true,
};

const ercWithdrawalEventParams: PartialContractEventParams =
  constructTransferParams(
    "0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf",
    false
  );

const etherDepositEventParams: ContractEventParams = {
  target: "0x8484Ef722627bf18ca5Ae6BcF031c23E6e922B30",
  topic: "LockedEther(address,address,uint256)",
  abi: [
    "event LockedEther (address indexed depositor, address indexed depositReceiver, uint256 amount)",
  ],
  argKeys: {
    from: "depositor",
    amount: "amount",
  },
  fixedEventData: {
    token: WETH
  },
  isDeposit: true,
};

const etherWithdrawalEventParams: ContractEventParams = {
  target: "0x8484Ef722627bf18ca5Ae6BcF031c23E6e922B30",
  topic: "ExitedEther(address,uint256)",
  abi: [
    "event ExitedEther(address indexed exitor, uint256 amount)",
  ],
  argKeys: {
    to: "exitor",
    amount: "amount",
  },
  fixedEventData: {
    token: WETH
  },
  isDeposit: false,
};

const constructParams = () => {
  const eventParams = [
    ercDepositEventParams,
    ercWithdrawalEventParams,
    etherDepositEventParams,
    etherWithdrawalEventParams
  ];
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("polygon", "ethereum", fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams(),
};

export default adapter;
