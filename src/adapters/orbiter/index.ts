import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

// type ChainName = "ethereum" | "arbitrum" | "zksync";
type ChainName = "ethereum";

// Orbiter Contracts on all supported chains
const bridgeAddresses = {
    ethereum: "0x80C67432656d59144cEFf962E8fAF8926599bCF8",
    // arbitrum: "0x80C67432656d59144cEFf962E8fAF8926599bCF8",
    // zksync: "0x80C67432656d59144cEFf962E8fAF8926599bCF8",
}

const constructParams = (chain: ChainName) => {
  let eventParams = [] as PartialContractEventParams[];
  const bridgeAddress = bridgeAddresses[chain];
  const depositParams = constructTransferParams(bridgeAddress, true, {
    excludeFrom: [bridgeAddress],
  });
  const withdrawParams = constructTransferParams(bridgeAddress, false, {
    excludeTo: [bridgeAddress],
  });
//   const withdrawParams = {
//     target: bridgeAddress,
//     topic: "Received(address,address,uint256,uint128,bytes4)",
//     abi: [
//       "event Received(address indexed recipient, address token, uint256 amount, uint128 indexed lockId, bytes4 source)",
//     ],
//     logKeys: {
//       blockNumber: "blockNumber",
//       txHash: "transactionHash",
//     },
//     argKeys: {
//       amount: "amount",
//       token: "token",
//       to: "recipient",
//     },
//     fixedEventData: {
//       from: bridgeAddress,
//     },
//     isDeposit: false,
//   };
  eventParams.push(depositParams, withdrawParams);
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("orbiter", chain as Chain, fromBlock, toBlock, eventParams);
};
  
const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
//   arbitrum: constructParams("arbitrum"),
//   "zksync era": constructParams("era"),
};

export default adapter;