import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { ethers } from "ethers";

const squidRouterAddress = "0xce16F69375520ab01377ce7B88f5BA8C48F8D666";

const routerAddresses = {
  ethereum: "0xce16F69375520ab01377ce7B88f5BA8C48F8D666",
  bsc: "0xce16F69375520ab01377ce7B88f5BA8C48F8D666",
  polygon: "0xce16F69375520ab01377ce7B88f5BA8C48F8D666",
  avax: "0xce16F69375520ab01377ce7B88f5BA8C48F8D666",
  fantom: "0xce16F69375520ab01377ce7B88f5BA8C48F8D666",
  arbitrum: "0xce16F69375520ab01377ce7B88f5BA8C48F8D666",
} as {
  [chain: string]: string;
};

const axelarGatewayAddresses = {
    ethereum: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
    bsc: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
    polygon: "0x6f015F16De9fC8791b234eF68D486d2bF203FBA8",
    avax: "0x5029C0EFf6C34351a0CEc334542cDb22c7928f78",
    fantom: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
    arbitrum: "0xe432150cce91c13a887f7D836923d5597adD8E31",
  } as {
    [chain: string]: string;
  };

const axelarGasService = {
    ethereum: "0x2d5d7d31F671F86C782533cc367F14109a082712",
    bsc: "0x2d5d7d31F671F86C782533cc367F14109a082712",
    polygon: "0x2d5d7d31F671F86C782533cc367F14109a082712",
    avax: "0x2d5d7d31F671F86C782533cc367F14109a082712",
    fantom: "0x2d5d7d31F671F86C782533cc367F14109a082712",
    arbitrum: "0x2d5d7d31F671F86C782533cc367F14109a082712",
    optimism: "0x2d5d7d31F671F86C782533cc367F14109a082712"
} as {
    [chain: string]: string
};

const nullAddress = "0x0000000000000000000000000000000000000000";

const TokenWithdrawalParams: PartialContractEventParams = {
    target: "",
    topic: "NativeGasPaidForContractCallWithToken(address,string,string,bytes32,string,uint256,uint256,address)",
    topics: [ethers.utils.id("NativeGasPaidForContractCallWithToken(address,string,string,bytes32,string,uint256,uint256,address)"), ethers.utils.hexZeroPad(squidRouterAddress,32)],
    abi: ["event NativeGasPaidForContractCallWithToken(address indexed sourceAddress, string destinationChain, string destinationAddress, bytes32 indexed payloadHash, string symbol, uint256 amount, uint256 gasFeeAmount, address refundAddress)"],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    //   token: "token"
    },
    argKeys: {
      from: "refundAddress",
      amount: "amount",
      to: "destinationAddress",
      token: "symbol"
    },
    isDeposit: false,

  };

  const GatewayWithdrawalParams: PartialContractEventParams = {
    target: "",
    topic: "ContractCallWithToken(address,string,string,bytes32,bytes,string,uint256)",
    // topics: [ethers.utils.id("NativeGasPaidForContractCallWithToken(address,string,string,bytes32,string,uint256,uint256,address)"), ethers.utils.hexZeroPad(squidRouterAddress,32)],
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
        from: (log: any) => log.payload.slice(0,32).toHexString(), // note: this is not the real sender address
        amount: (log: any) => log.amount,
        to: (log: any) => log.payload.slice(10,42).toHexString(),
        token: (log: any) => log.symbol,
      },
    isDeposit: false,

  };

const constructParams = (chain: string) => {
  let eventParams = [] as PartialContractEventParams[];
  const addy = axelarGasService[chain];

//   const depositTransfer = constructTransferParams(addy, true, {
//     excludeFrom: [addy, nullAddress],
//     excludeTo: [nullAddress],
//     includeTo: [addy],
//   });

//   const withdraw = constructTransferParams(addy, false, {
//     excludeFrom: [nullAddress],
//     excludeTo: [nullAddress, addy],
//     includeFrom: [addy],
//   });
//   const deposit = {...TokenWithdrawalParams, target: axelarGasService[chain], };
  const deposit = {...GatewayWithdrawalParams, target: axelarGatewayAddresses[chain], };


  eventParams.push(deposit);

  return async (fromBlock: number, toBlock: number) =>
    await getTxDataFromEVMEventLogs("squidrouter", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  polygon: constructParams("polygon"),
  fantom: constructParams("fantom"),
  avalanche: constructParams("avax"),
  bsc: constructParams("bsc"),
  ethereum: constructParams("ethereum"),
  arbitrum: constructParams("arbitrum"),
};

export default adapter;
