import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { ethers } from "ethers";
import { fetchAssets, getTokenAddress} from "./utils";

const squidRouterAddress = "0xce16F69375520ab01377ce7B88f5BA8C48F8D666";

const axelarGatewayAddresses = {
    ethereum: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
    bsc: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
    polygon: "0x6f015F16De9fC8791b234eF68D486d2bF203FBA8",
    avax: "0x5029C0EFf6C34351a0CEc334542cDb22c7928f78",
    fantom: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
    arbitrum: "0xe432150cce91c13a887f7D836923d5597adD8E31",
    base: "0xe432150cce91c13a887f7d836923d5597add8e31",
    linea: "0xe432150cce91c13a887f7d836923d5597add8e31",
    celo: "0xe432150cce91c13a887f7d836923d5597add8e31",
    moonbeam: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
    kava: "0xe432150cce91c13a887f7D836923d5597adD8E31",
    filecoin: "0xe432150cce91c13a887f7D836923d5597adD8E31"
  } as {
    [chain: string]: string;
  };

  const constructGatewayWithdrawalParams = (assets: any[], chain: string) => {
    let GatewayWithdrawalParams: PartialContractEventParams;
    
    return  GatewayWithdrawalParams = {
      target: "",
      topic: "ContractCallWithToken(address,string,string,bytes32,bytes,string,uint256)",
      topics: [ethers.utils.id("ContractCallWithToken(address,string,string,bytes32,bytes,string,uint256)"), ethers.utils.hexZeroPad(squidRouterAddress,32)],
      abi: ["event ContractCallWithToken(address indexed sender, string destinationChain, string destinationContractAddress, bytes32 indexed payloadHash, bytes payload, string symbol, uint256 amount)"],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      //   token: "token"
      },
      argKeys: {
        from: "payload",
        amount: "amount",
        to: "destinationContractAddress",
        token: "symbol"
      },
      argGetters: {
          from: (log: any) => "0x".concat(log.payload.substr(90,40)), // note: this is not the real sender address
          amount: (log: any) => log.amount,
          to: (log: any) => "0x".concat(log.payload.substr(log.payload.lastIndexOf(log.payload.substr(90,40)),40)),
          token: (log: any) => getTokenAddress(log.symbol, chain, assets)
        },
      isDeposit: false,
  
    };

  }


  const constructGatewayDepositParams = (assets: any[], chain: string) => {
    let GatewayDepositParams: PartialContractEventParams;

    return GatewayDepositParams = {
      target: "",
      topic: "ContractCallApprovedWithMint(bytes32,string,string,address,bytes32,string,uint256,bytes32,uint256)",
      topics: [ethers.utils.id("ContractCallApprovedWithMint(bytes32,string,string,address,bytes32,string,uint256,bytes32,uint256)"), null, ethers.utils.hexZeroPad(squidRouterAddress,32)],
      abi: ["event ContractCallApprovedWithMint(bytes32 indexed commandId, string sourceChain, string sourceAddress, address indexed contractAddress, bytes32 indexed payloadHash, string symbol, uint256 amount, bytes32 sourceTxHash, uint256 sourceEventIndex)"],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      //   token: "token"
      },
      argKeys: {
        from: "sourceAddress",
        amount: "amount",
        to: "contractAddress",
        token: "symbol"
      },
      argGetters: {
        from: (log: any) => log.sourceAddress,
        amount: (log: any) => log.amount,
        to: (log: any) => log.contractAddress,
        token: (log: any) => getTokenAddress(log.symbol, chain, assets)
      },
      isDeposit: true,
    };
  }


const constructParams = (chain: string) => {

  return async (fromBlock: number, toBlock: number) => {
    let eventParams = [] as PartialContractEventParams[];
    // fetch all assets from axelarscan
    const assets = await fetchAssets();

    const GatewayDepositParams = constructGatewayDepositParams(assets, chain);
    const deposit = {...GatewayDepositParams, target: axelarGatewayAddresses[chain], };
    
    const GatewayWithdrawalParams = constructGatewayWithdrawalParams(assets, chain);
    const withdraw = {...GatewayWithdrawalParams, target: axelarGatewayAddresses[chain], };


    eventParams.push(deposit, withdraw);

    return getTxDataFromEVMEventLogs("squidrouter", chain as Chain, fromBlock, toBlock, eventParams);
  }
    
};

const adapter: BridgeAdapter = {
  polygon: constructParams("polygon"),
  fantom: constructParams("fantom"),
  avalanche: constructParams("avax"),
  bsc: constructParams("bsc"),
  ethereum: constructParams("ethereum"),
  arbitrum: constructParams("arbitrum"),
  base: constructParams("base"),
  linea: constructParams("linea"),
  celo: constructParams("celo"),
  moonbeam: constructParams("moonbeam"),
  kava: constructParams("kava"),
  filecoin: constructParams("filecoin")
};

export default adapter;
