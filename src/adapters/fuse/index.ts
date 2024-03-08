import {
    BridgeAdapter,
    ContractEventParams,
    PartialContractEventParams,
} from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const ercContracts = {
    ethereum: "0x95f51f18212c6bCFfB819fDB2035E5757954B7B9",
    polygon: "0x8f5D6332eD11338D2dA4fAAC6675e9A6757BeC8b",
    arbitrum: "0x081dF5af5d022D4A4a4520D4D0D336B8432fDBBb",
    optimism: "0x081dF5af5d022D4A4a4520D4D0D336B8432fDBBb",
    bsc: "0x081dF5af5d022D4A4a4520D4D0D336B8432fDBBb",
} as { [chain: string]: string };

const nativeContracts = {
    polygon: "0xe453d6649643F1F460C371dC3D1da98F7922fe51",
    arbitrum: "0xe453d6649643F1F460C371dC3D1da98F7922fe51",
    optimism: "0xEEd9154F63f6F0044E6b00dDdEFD895b5B4ED580",
    bsc: "",
    ethereum: "",
} as { [chain: string]: string };

const ercDepositEventParams: ContractEventParams = {
    target: null,
    topic: "SendToken(address,address,address,uint256)",
    abi: [
        "event SendToken(address token, address from, address to, uint256 amount)",
    ],
    argKeys: {
        token: "token",
        from: "from",
        amount: "amount",
    },
    isDeposit: true,
};

const ercWithdrawalEventParams: ContractEventParams = {
    target: null,
    topic: "ReceiveToken(address,address,uint256)",
    abi: [
        "event ReceiveToken(address token, address to, uint256 amount)",
    ],
    argKeys: {
        token: "token",
        from: "to",
        amount: "amount",
    },
    isDeposit: false,
};

const nativeWithdrawalEventParams: ContractEventParams = {
    target: null,
    topic: "WrapToken(address,address,uint16,address,uint256)",
    abi: [
        "event WrapToken(address localToken, address remoteToken, uint16 remoteChainId, address to, uint256 amount)",
    ],
    argKeys: {
        token: "localToken",
        from: "to",
        amount: "amount",
    },
    isDeposit: false,
};

const nativeDepositEventParams: ContractEventParams = {
    target: null,
    topic: "UnwrapToken(address,address,uint16,address,uint256)",
    abi: [
        "event UnwrapToken(address localToken, address remoteToken, uint16 remoteChainId, address to, uint256 amount)",
    ],
    argKeys: {
        token: "localToken",
        from: "from",
        amount: "amount",
    },
    isDeposit: true,
};

const constructParams = (chain: string) => {
    const eventParams: PartialContractEventParams[] = [];

    const ercContract = ercContracts[chain];
    const ercDepositParams = {
        ...ercDepositEventParams,
        target: ercContract,
    }
    const ercWithdrawParams = {
        ...ercWithdrawalEventParams,
        target: ercContract,
    }
    const nativeContract = nativeContracts[chain];
    if (nativeContract !== "") {
        const nativeDepositParams = {
            ...nativeDepositEventParams,
            target: nativeContract,
        }
        const nativeWithdrawParams = {
            ...nativeWithdrawalEventParams,
            target: nativeContract,
        }
        eventParams.push(nativeDepositParams, nativeWithdrawParams);
    }
    eventParams.push(ercDepositParams, ercWithdrawParams);
    return async (fromBlock: number, toBlock: number) =>
        getTxDataFromEVMEventLogs("fuse", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
    polygon: constructParams("polygon"),
    ethereum: constructParams("ethereum"),
    bsc: constructParams("bsc"),
    arbitrum: constructParams("arbitrum"),
    optimism: constructParams("optimism"),
};

export default adapter;
