import { BridgeAdapter, ContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

// Define the parameters for listening to deposit and withdrawal events
const depositEventParams: ContractEventParams = {
    target: "0x4D878E8Fb90178588Cda4cf1DCcdC9a6d2757089",
    topic: "Deposit(uint8,bytes32,uint64,address,bytes,bytes)",
    abi: [
        "event Deposit(uint8 destinationDomainID, bytes32 resourceID, uint64 depositNonce, address indexed user, bytes data, bytes handlerResponse)"
    ],
    logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
    },
    argKeys: {
        to: "user",
    },
    fixedEventData: {},
    isDeposit: true
};

const withdrawalEventParams: ContractEventParams = {
    target: "0x4D878E8Fb90178588Cda4cf1DCcdC9a6d2757089",
    topic: "ProposalExecution(uint8,uint64,bytes32,bytes)",
    abi: [
        "event ProposalExecution(uint8 originDomainID, uint64 depositNonce, bytes32 dataHash, bytes handlerResponse)"
    ],
    argKeys: {},
    fixedEventData: {},
    isDeposit: false
};

// This function constructs the parameters based on the events defined above
const constructParams = () => {
  const eventParams = [depositEventParams, withdrawalEventParams];
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("sygma", "ethereum", fromBlock, toBlock, eventParams);
};

// Define the adapter for each chain your bridge operates on
const adapter: BridgeAdapter = {
  ethereum: constructParams(),
  // Add other chains as necessary
};

export default adapter;
