import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getEVMEventLogs } from "../../helpers/eventLogs";
import { constructTransferParams } from "../../helpers/eventParams";

// 0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1 is Optimism: Gateway
// 0x467194771dAe2967Aef3ECbEDD3Bf9a310C76C65 is Optimism: L1 Escrow (DAI)

const depositEventParams: PartialContractEventParams = {
  target: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1",
  topic: "ERC20DepositInitiated(address,address,address,address,uint256,bytes)",
  abi: [
    "event ERC20DepositInitiated(address indexed _l1Token, address indexed _l2Token, address indexed _from, address _to, uint256 _amount, bytes _data)",
  ],
  isDeposit: true,
};

const constructParams = () => {
  const eventParams = [depositEventParams];
  return async (fromBlock: number, toBlock: number) =>
    getEVMEventLogs("optimism", "ethereum", fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  optimism: constructParams(),
};

export default adapter;
