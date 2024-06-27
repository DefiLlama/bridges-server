import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";


const contracts: { [key: string]: string } = {
  bsc: '0x56b3e5cdbf4d1dc4d7cdc81e6f16d1404c463773',
	manta: '0xF68fa6D10810c91dd97454657b17EcB7dCECc96D',
	arbitrum: '0xF68fa6D10810c91dd97454657b17EcB7dCECc96D'
}
// topic: "OrderCompleted(uint256,uint256,bytes32)",
// abi: [
// 	"event OrderCompleted(uint256 indexed id, uint256 indexed chainIdFrom, bytes32 orderHash)"
// ],
// topic: "OrderCreated(uint256,tuple(uint256,uint256,address,address,uint256,uint256,uint256,uint256,address,address,bool,uint256,bool),uint256)",
// abi: [
// 	"event OrderCreated(uint256 indexed id, tuple(uint256 id, uint256 tokenId, address sender, address recipient, uint256 chainId, uint256 amount, uint256 feeAmount, uint256 decimals, address tokenIn, address tokenOut, bool payInNative, uint256 timestamp, bool closed) order, uint256 feeAmount)"
// ],
const orderCompletedParams: PartialContractEventParams = {
  target: "",
	topic: "OrderCreated(uint256,tuple(uint256,uint256,address,address,uint256,uint256,uint256,uint256,address,address,bool,uint256,bool),uint256)",
	abi: [
		"event OrderCreated(uint256 indexed id, tuple(uint256 id, uint256 tokenId, address sender, address recipient, uint256 chainId, uint256 amount, uint256 feeAmount, uint256 decimals, address tokenIn, address tokenOut, bool payInNative, uint256 timestamp, bool closed) order, uint256 feeAmount)"
	],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash"
  },
	argKeys: {
    amount: "order.amount",
    token: "order.tokenId",
  },
  isDeposit: true
};


const constructParams = (chain: string) => {
	return async (fromBlock: number, toBlock: number) => {
		const events = await getTxDataFromEVMEventLogs("ceto-swap", chain as Chain, fromBlock, toBlock, [
			{
				...orderCompletedParams,
				target: contracts[chain]
			}
		]);
		return events;
	};
}

const adapter: BridgeAdapter = {
  bsc: constructParams('bsc'),
  manta: constructParams('manta'),
  arbitrum: constructParams('arbitrum'),
};

export default adapter;