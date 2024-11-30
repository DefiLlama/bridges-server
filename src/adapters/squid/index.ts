import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { ethers } from "ethers";
import { fetchAssets, getTokenAddress} from "./utils";
import { axelarGatewayAddresses, squidRouterAddresses, coralSpokeAddress } from "./constants";

const constructGatewayWithdrawalParams = (assets: any[], chain: string) => {
    const squidRouterAddress = squidRouterAddresses[chain as keyof typeof squidRouterAddresses] || squidRouterAddresses.default;
    
    return {
      target: "",
      topic: "ContractCallWithToken(address,string,string,bytes32,bytes,string,uint256)",
      topics: [ethers.utils.id("ContractCallWithToken(address,string,string,bytes32,bytes,string,uint256)"), 
              ethers.utils.hexZeroPad(squidRouterAddress,32)],
      abi: ["event ContractCallWithToken(address indexed sender, string destinationChain, string destinationContractAddress, bytes32 indexed payloadHash, bytes payload, string symbol, uint256 amount)"],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
      argKeys: {
        from: "payload",
        amount: "amount",
        to: "destinationContractAddress",
        token: "symbol"
      },
      argGetters: {
          from: (log: any) => "0x".concat(log.payload.substr(90,40)),
          amount: (log: any) => log.amount,
          to: (log: any) => "0x".concat(log.payload.substr(log.payload.lastIndexOf(log.payload.substr(90,40)),40)),
          token: (log: any) => getTokenAddress(log.symbol, chain, assets)
      },
      isDeposit: false,
    };
}

const constructGatewayDepositParams = (assets: any[], chain: string) => {
    const squidRouterAddress = squidRouterAddresses[chain as keyof typeof squidRouterAddresses] || squidRouterAddresses.default;
    
    return {
      target: "",
      topic: "ContractCallApprovedWithMint(bytes32,string,string,address,bytes32,string,uint256,bytes32,uint256)",
      topics: [ethers.utils.id("ContractCallApprovedWithMint(bytes32,string,string,address,bytes32,string,uint256,bytes32,uint256)"), 
              null, 
              ethers.utils.hexZeroPad(squidRouterAddress,32)],
      abi: ["event ContractCallApprovedWithMint(bytes32 indexed commandId, string sourceChain, string sourceAddress, address indexed contractAddress, bytes32 indexed payloadHash, string symbol, uint256 amount, bytes32 sourceTxHash, uint256 sourceEventIndex)"],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
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

const constructCoralWithdrawalParams = (chain: string) => {
  return {
    target: coralSpokeAddress,
    topic: "OrderCreated(bytes32,tuple)",
    topics: [
      "0x181de28643611afcf1cb4c095a1ef99c157e78437294f478c978e4a56e1ca77e"
    ],
    abi: [
      "event OrderCreated(bytes32 indexed orderHash, tuple(address fromAddress, address toAddress, address filler, address fromToken, address toToken, uint256 expiry, uint256 fromAmount, uint256 fillAmount, uint256 feeRate, uint256 fromChain, uint256 toChain, bytes32 postHookHash) order)"
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      from: "order",
      amount: "order",
      to: "order",
      token: "order"
    },
    argGetters: {
      from: (log: any) => log.order.fromAddress,
      amount: (log: any) => log.order.fromAmount,
      to: (log: any) => log.order.toAddress,
      token: (log: any) => log.order.fromToken
    },
    isDeposit: false,
  };
}

const constructCoralDepositParams = (chain: string) => {
  return {
    target: coralSpokeAddress,
    topic: "OrderFilled(bytes32,tuple)",
    topics: [
      "0x6955fd9b2a7639a9baac024897cad7007b45ffa74cbfe9582d58401ff6b977b7"
    ],
    abi: [
      "event OrderFilled(bytes32 indexed orderHash, tuple(address fromAddress, address toAddress, address filler, address fromToken, address toToken, uint256 expiry, uint256 fromAmount, uint256 fillAmount, uint256 feeRate, uint256 fromChain, uint256 toChain, bytes32 postHookHash) order)"
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      from: "order",
      amount: "order",
      to: "order",
      token: "order"
    },
    argGetters: {
      from: (log: any) => log.order.fromAddress,
      amount: (log: any) => log.order.fillAmount,
      to: (log: any) => log.order.toAddress,
      token: (log: any) => log.order.toToken
    },
    isDeposit: true,
  };
}

const constructParams = (chain: string) => {
  return async (fromBlock: number, toBlock: number) => {
    let eventParams = [] as PartialContractEventParams[];
    const assets = await fetchAssets();

    // Add gateway params
    const GatewayDepositParams = constructGatewayDepositParams(assets, chain);
    const deposit = {...GatewayDepositParams, target: axelarGatewayAddresses[chain]};
    
    const GatewayWithdrawalParams = constructGatewayWithdrawalParams(assets, chain);
    const withdraw = {...GatewayWithdrawalParams, target: axelarGatewayAddresses[chain]};

    // Add Coral params
    const coralDeposit = constructCoralDepositParams(chain);
    const coralWithdraw = constructCoralWithdrawalParams(chain);

    eventParams.push(deposit, withdraw, coralDeposit, coralWithdraw);

    return getTxDataFromEVMEventLogs("squid", chain as Chain, fromBlock, toBlock, eventParams);
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
  filecoin: constructParams("filecoin"),
  optimism: constructParams("optimism"),
  mantle: constructParams("mantle"),
  scroll: constructParams("scroll"),
  blast: constructParams("blast"),
  fraxtal: constructParams("fraxtal"),
  immutable: constructParams("immutable"),
};

export default adapter;