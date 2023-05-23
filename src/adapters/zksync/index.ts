import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";

/* 

0x32400084C286CF3E17e7B677ea9583e60a000324 is zkSync Era: Diamond Proxy
0xf8A16864D8De145A266a534174305f881ee2315e is zkSync Era: Withdrawal Finalizer
0x57891966931Eb4Bb6FB81430E6cE0A03AAbDe063 is zkSync Era: Bridge
*/

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const ethDepositEventParams: PartialContractEventParams = {
    target: "0x32400084C286CF3E17e7B677ea9583e60a000324",
    topic: "NewPriorityRequest(uint256,bytes32,uint64,tuple,bytes[]",
    abi: [
      "event NewPriorityRequest(uint256 txId, bytes32 txHash, uint64 expirationTimestamp, tuple transaction, bytes[] factoryDeps)",
    ],
    argKeys: {
      from: "transaction.from",
      amount: "transaction.value",
    },
    fixedEventData: {
        token: WETH,
    },
    isDeposit: true,
};

const erc20DepositEventParams: PartialContractEventParams = {
    target: "0x57891966931Eb4Bb6FB81430E6cE0A03AAbDe063",
    topic: "DepositInitiated(bytes32,address,address,address,uint256",
    abi: [
      "event DepositInitiated(index_topic_1 bytes32 l2DepositTxHash, index_topic_2 address from, index_topic_3 address to, address l1Token, uint256 amount)",
    ],
    argKeys: {
      token: "l1Token",
      from: "from",
      amount: "amount",
    },
    isDeposit: true,
};

const ethWithdrawalEventParams: PartialContractEventParams = {
    target: "0xf8A16864D8De145A266a534174305f881ee2315e",
    topic: "EthWithdrawalFinalized(address,uint256)",
    abi: [
        "event EthWithdrawalFinalized(index_topic_1 address to, uint256 amount)",
    ],
    argKeys: {
        to: "to",
        amount: "amount",
    },
    fixedEventData: {
        token: WETH,
    },
    isDeposit: false,
};

const erc20WithdrawalEventParams: PartialContractEventParams = {
    target: "0x57891966931eb4bb6fb81430e6ce0a03aabde063",
    topic: "WithdrawalFinalized(address,address,uint256)",
    abi: [
        "event WithdrawalFinalized(index_topic_1 address to, index_topic_2 address l1Token, uint256 amount)",
    ],
    argKeys: {
        token: "l1Token",
        to: "to",
        amount: "amount",
    },
    isDeposit: false,
};


const constructParams = () => {
const eventParams = [
    ethDepositEventParams,
    erc20DepositEventParams,
    ethWithdrawalEventParams,
    erc20WithdrawalEventParams,
];
return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("zksync", "ethereum", fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
ethereum: constructParams(),
};

export default adapter;