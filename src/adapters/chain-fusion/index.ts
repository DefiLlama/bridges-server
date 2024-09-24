import {
    BridgeAdapter,
    ContractEventParams,
    PartialContractEventParams,
} from "../../helpers/bridgeAdapter.type";
import { getTxsBlockRangeEtherscan, wait } from "../../helpers/etherscan";
import { getTxsBlockRangeMerlinScan } from "../../helpers/merlin";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import axios from 'axios';
import { EventData } from "../../utils/types";

async function get_erc2Contracts(){
    let api_call = 'https://icrc-api.internetcomputer.org/api/v2/ledgers?network=mainnet&token_types=chain_key&sort_by=ledger_canister_id&include_total_supply_7d=false';
    let response = await axios.get(api_call);
    let erc20_contracts = [];
    for (let i = 0; i < response.data.data.length; i++) {
        let token_info = response.data.data[i];
        if (token_info.token_type === 'chain_key') {
            if (token_info.ckerc20_contract !== null) {
                erc20_contracts.push(token_info.ckerc20_contract.address);
            }
        }
    }
    return erc20_contracts;
}

const eth_minter_address = "0xb25eA1D493B49a1DeD42aC5B1208cC618f9A9B80";
const eth_helper_contract = "0x7574eB42cA208A4f6960ECCAfDF186D627dCC175"
const erc20_helper_contract = "0x6abDA0438307733FC299e9C229FD3cc074bD8cC0"
const weth_contract_addresss = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"

const ercDepositEventParams: ContractEventParams = {
    target: null,
    topic: "ReceivedErc20(address, address, uint256, bytes32)",
    abi: [
        "event ReceivedErc20(address indexed erc20_contract_address, address indexed owner, uint256 amount, bytes32 indexed principal)",
    ],
    argKeys: {
        token: "erc20_contract_address",
        from: "owner",
        amount: "amount",
        to: 'principal'
    },
    isDeposit: true,
};

const ercWithdrawalEventParams: ContractEventParams = {
    target: null,
    topic: "Transfer(address,address,uint256)",
    abi: ["event Transfer(address indexed from, address indexed to, uint256 value)"],
    argKeys: {
        to: "to",
        from: "from",
        amount: "value",
    },
    isDeposit: false,
};

const ethDepositEventParams: ContractEventParams = {
    target: null,
    topic: "ReceivedEth(address, uint256, bytes32)",
    abi: [
        "event ReceivedEth(address indexed from, uint256 value, bytes32 indexed principal)",
    ],
    argKeys: {
        from: "from",
        amount: "value",
        to: 'principal'
    },
    isDeposit: true,
};

const nativeTokenTransferSignature = ["0x535741", "0x"];


function constructParams(chain: string) {
    return async (fromBlock: number, toBlock: number) => {
        const eventParams: PartialContractEventParams[] = [];

            let ercContracts = await get_erc2Contracts();
            for (let i = 0; i < ercContracts.length; i++) {
                const ercContract = ercContracts[i];
                // Erc20 deposits to the Erc20 helper contract
                const ercDepositParams = {
                    ...ercDepositEventParams,
                    target: erc20_helper_contract,
                }
                // Erc20 withdrawals through the Erc20 token contract
                let ercWithdrawParams = {
                    ...ercWithdrawalEventParams,
                    target: ercContract,
                    fixedEventData: {
                        from: eth_minter_address,
                    }
                }
                // We set the token address for the erc20 withdrawal event
                if  (ercWithdrawParams.argKeys) {
                    ercWithdrawParams.argKeys.token = ercContract;
                }
                eventParams.push(ercDepositParams, ercWithdrawParams);
            }   

            // Eth deposits to the Ethereum helper contract
            eventParams.push({
                ...ethDepositEventParams,
                target: eth_helper_contract,
            });

            let eventLogData = await getTxDataFromEVMEventLogs("chain-fusion", chain, fromBlock, toBlock, eventParams);

            // Eth withdrawals through native Eth transactions
            const nativeEvents = await Promise.all(
                (await getTxsBlockRangeEtherscan(chain, eth_minter_address, fromBlock, toBlock, {
                    includeSignatures: nativeTokenTransferSignature,
                    // Withdrawals are Eth native transfers where the from address is the minter
                })).filter((tx:any) => {tx.from == eth_minter_address}).map((tx: any) => {
                    const event: EventData = {
                        txHash: tx.hash,
                        blockNumber: +tx.blockNumber,
                        from: tx.from,
                        to: tx.to,
                        token: weth_contract_addresss,
                        amount: tx.value,
                        isDeposit: false,
                    };
                    return event;
                })
            );
              const allEvents = [...eventLogData, ...nativeEvents.flat()];
              return allEvents;
};
}


const adapter: BridgeAdapter = {
    ethereum: constructParams("ethereum"),
};

export default adapter;