import { BridgeAdapter, PartialContractEventParams, ContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";

/* 

0x32400084C286CF3E17e7B677ea9583e60a000324 is zkSync Era: Diamond Proxy
    - deposits of 
        - ETH
0xf8A16864D8De145A266a534174305f881ee2315e is zkSync Era: Withdrawal Finalizer
0x57891966931Eb4Bb6FB81430E6cE0A03AAbDe063 is zkSync Era: Bridge
    - deposits of 
        - ERC20
    - withdrawals of 
        - ETH
        - ERC20
*/

const erc20DepositEventParams: PartialContractEventParams =
  constructTransferParams(
    "0x57891966931Eb4Bb6FB81430E6cE0A03AAbDe063",
    true
);

const erc20WithdrawalEventParams: PartialContractEventParams =
  constructTransferParams(
    "0x57891966931Eb4Bb6FB81430E6cE0A03AAbDe063",
    false
);

const constructParams = () => {
const eventParams = [
    erc20DepositEventParams,
    erc20WithdrawalEventParams,
];
return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("zksync", "ethereum", fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
    ethereum: constructParams(),
};
  
export default adapter;
