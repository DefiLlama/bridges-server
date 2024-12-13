import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { ethers } from "ethers";
import { fetchAssets, getTokenAddress, getTokenId } from "./utils";
import { axelarGatewayAddresses, squidRouterAddresses, coralSpokeAddresses, stablecoins } from "./constants";
import { isStablecoin } from "./utils";


const constructGatewayWithdrawalParams = (assets: any[], chain: string) => {
    const squidRouterAddress = squidRouterAddresses[chain as keyof typeof squidRouterAddresses] || squidRouterAddresses.default;
    
    return {
      target: "",
      topic: "ContractCallWithToken(address,string,string,bytes32,bytes,string,uint256)",
      topics: [ethers.utils.id("ContractCallWithToken(address,string,string,bytes32,bytes,string,uint256)"), ethers.utils.hexZeroPad(squidRouterAddress,32)],
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
};

const constructGatewayDepositParams = (assets: any[], chain: string) => {
  const squidRouterAddress = squidRouterAddresses[chain as keyof typeof squidRouterAddresses] || squidRouterAddresses.default;
  
  return {
    target: "",
    topic: "ContractCallWithToken(address,string,string,bytes32,bytes,string,uint256)",
    topics: [ethers.utils.id("ContractCallWithToken(address,string,string,bytes32,bytes,string,uint256)"), ethers.utils.hexZeroPad(squidRouterAddress,32)],
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
      to: (log: any) => log.destinationContractAddress,
      token: (log: any) => getTokenAddress(log.symbol, chain, assets),
      is_usd_volume: (log: any) => isStablecoin(log.symbol, chain)
    },
    isDeposit: true,
  };
};

const constructCoralWithdrawParams = (assets: any[], chain: string) => {
  return {
    target: coralSpokeAddresses.default,
    topic: "OrderCreated(bytes32,(address,address,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,bytes32))",
    topics: [ethers.utils.id("OrderCreated(bytes32,(address,address,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,bytes32))")],
    abi: ["event OrderCreated(bytes32 indexed orderHash, tuple(address fromAddress, address toAddress, address filler, address fromToken, address toToken, uint256 expiry, uint256 fromAmount, uint256 fillAmount, uint256 feeRate, uint256 fromChain, uint256 toChain, bytes32 postHookHash) order)"],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      from: "args",
      amount: "args",
      to: "args",
      token: "args"
    },
    argGetters: {
      from: (log: any) => log[1].fromAddress,
      amount: (log: any) => log[1].fromAmount,
      to: (log: any) => log[1].toAddress,
      token: (log: any) => getTokenAddress(log[1].fromToken, chain, assets),
      is_usd_volume: (log: any) => isStablecoin(log[1].fromToken, chain)
    },
    isDeposit: false,
  };
};

const constructCoralDepositParams = (assets: any[], chain: string) => {
  return {
    target: coralSpokeAddresses.default,
    topic: "OrderFilled(bytes32,(address,address,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,bytes32))",
    topics: [ethers.utils.id("OrderFilled(bytes32,(address,address,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,bytes32))")],
    abi: ["event OrderFilled(bytes32 indexed orderHash, tuple(address fromAddress, address toAddress, address filler, address fromToken, address toToken, uint256 expiry, uint256 fromAmount, uint256 fillAmount, uint256 feeRate, uint256 fromChain, uint256 toChain, bytes32 postHookHash) order)"],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      from: "args",
      amount: "args",
      to: "args",
      token: "args"
    },
    argGetters: {
      from: (log: any) => log[1].fromAddress,
      amount: (log: any) => log[1].fromAmount,
      to: (log: any) => log[1].toAddress,
      token: (log: any) => getTokenAddress(log[1].fromToken, chain, assets),
      is_usd_volume: (log: any) => isStablecoin(log[1].fromToken, chain)
    },
    isDeposit: true,
  };
};

const constructParams = (chain: string) => {
  return async (fromBlock: number, toBlock: number) => {
    const assets = await fetchAssets();
    const eventParams = [];

    // Gateway params
    const gatewayDepositParams = constructGatewayDepositParams(assets, chain);
    const gatewayWithdrawalParams = constructGatewayWithdrawalParams(assets, chain);
    
    const deposit = {...gatewayDepositParams, target: axelarGatewayAddresses[chain]};
    const withdraw = {...gatewayWithdrawalParams, target: axelarGatewayAddresses[chain]};

    // Coral params
    const coralDepositParams = constructCoralDepositParams(assets, chain);
    const coralWithdrawParams = constructCoralWithdrawParams(assets, chain);
    
    const coralDeposit = {...coralDepositParams, target: coralSpokeAddresses.default};
    const coralWithdraw = {...coralWithdrawParams, target: coralSpokeAddresses.default};

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