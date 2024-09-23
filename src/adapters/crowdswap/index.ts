import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";


const gatewayAddresses = {
  ethereum: "0x22715dfF101D33B2a14a4834f7C527902Bc42899",
  bsc: "0x587AaA2150AD416bAD6b9919FDfF2D78BE11383B",
  polygon: "0x9092fCF5Ea1E22f2922eEa132D2931CDd795ab53",
  optimism: "0x1B3aE33ff0241999854C05B0CdF821DE55A4404A",
  arbitrum: "0x99a68649E927774680e9D3387BF8cCbF93B45230",
} as {
  [chain: string]: string;
};


let routerAddresses = {} as {
  [chain: string]: string[];
};

const activeChains = ["ethereum", "bsc", "polygon", "optimism", "arbitrum"];

for(const chain of activeChains){
  if(!routerAddresses[chain]){
    routerAddresses[chain] = ["0x549D287218E5fc9D07A91Fe2e1337D5c21B808B2","0x30462a4863a3db9233006a87320a8e07c4a71a36"]
  }
}


const constructParams = (chain: string) => {
  let eventParams = [] as PartialContractEventParams[];
  const routers = routerAddresses[chain];

  for (const router of Object.values(routers)) {
    const deposit :PartialContractEventParams = {
      target: router,
      topic: "MessageSent(bytes32,uint256,uint256,uint256,address,address,uint64)",
      abi: ["event MessageSent(bytes32 indexed messageId, uint256 sourceAmount, uint256 destinationAmount, uint256 destinationMinAmount, address sourceTokenAddress, address destinationTokenAddress, uint64 indexed destinationChainId)"],
      isDeposit: true,
      logKeys: {
        blockNumber:  "blockNumber", 
        txHash:  "transactionHash",
      },
      argKeys: {
        amount: "sourceAmount",
        token: "sourceTokenAddress"
      },
      fixedEventData: {
        to: gatewayAddresses[chain],
        from: router,
      },
    };
    
    const withdraw :PartialContractEventParams = {
      target: router,
      topic: "Sold(bytes32,address,uint256,uint256,address,uint256,uint256,address,uint256,uint256)",
      abi: ["event Sold(bytes32 indexed messageId, address sourceTokenAddress, uint256 sourceAmount, uint256 usdValue, address crowdAddress, uint256 crowdAmount, uint256 crowdPrice, address tokenXAddress, uint256 tokenXAmount, uint256 tokenXPrice)"],
      isDeposit: false, // event type 
      logKeys: {
        blockNumber:  "blockNumber", 
        txHash:  "transactionHash",
      },
      argKeys: {
        amount: "tokenXAmount",
        token: "tokenXAddress",
      
      },
      fixedEventData: {
        from: router,
        to: gatewayAddresses[chain],
      },
    };

    eventParams.push(deposit, withdraw);
  }
  return async (fromBlock: number, toBlock: number) =>
    await getTxDataFromEVMEventLogs("crowdswap", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  polygon: constructParams("polygon"),
  bsc: constructParams("bsc"),
  ethereum: constructParams("ethereum"),
  arbitrum: constructParams("arbitrum"),
  optimism: constructParams("optimism"),
};

export default adapter;
