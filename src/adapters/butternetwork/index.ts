import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const contractAddresses = {
  bsc: {
    mosContract: "0xfeB2b97e4Efce787c08086dC16Ab69E063911380",
    tokens: {
      USDT: "0x55d398326f99059fF775485246999027B3197955",
      USDC: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
      DAI: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
      ETH: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
      MAP: "0x8105ECe4ce08B6B6449539A5db23e23b973DfA8f"
    }
  },
  polygon: {
    mosContract: "0xfeB2b97e4Efce787c08086dC16Ab69E063911380",
    tokens: {
      USDT: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
      USDC: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
      DAI: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
      ETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      MAP: "0xBAbceE78586d3e9E80E0d69601A17f983663Ba6a"
    }
  },
  ethereum: {
    mosContract: "0xfeB2b97e4Efce787c08086dC16Ab69E063911380",
    tokens: {
      USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      ETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      MAP: "0x9e976f211daea0d652912ab99b0dc21a7fd728e4"
    }
  },
  map: {
    mosContract: "0xfeB2b97e4Efce787c08086dC16Ab69E063911380",
    tokens: {
      USDT: "0x33daba9618a75a7aff103e53afe530fbacf4a3dd",
      USDC: "0x9f722b2cb30093f766221fd0d37964949ed66918",
      DAI: "0xEdDfAac857cb94aE8A0347e2b1b06f21AA1AAeFA",
      ETH: "0x05ab928d446d8ce6761e368c8e7be03c3168a9ec",
      MAP: "0x13cb04d4a5dfb6398fc5ab005a6c84337256ee23"
    }
  }
} as {
  [chain: string]: {
    mosContract: string;
    tokens: {};
  };
};

const tokenDepositParams: PartialContractEventParams = {
  target: "",
  topic: "mapSwapIn(uint256,uint256,bytes32,address,bytes,address,uint256)",
  abi: [
    "event mapSwapIn(uint256 indexed fromChain, uint256 indexed toChain, bytes32 indexed orderId, address token, bytes from, address toAddress, uint256 amountOut)"
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash"
  },
  argKeys: {
    from: "from",
    to: "toAddress",
    token: "token",
    amount: "amountOut"
  },
  isDeposit: true
};

const tokenWithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "mapSwapOut(uint256,uint256,bytes32,bytes,bytes,bytes,uint256,bytes)",
  abi: ["event mapSwapOut(uint256 indexed fromChain, uint256 indexed toChain, bytes32 orderId, bytes token, bytes from, bytes to, uint256 amount, bytes swapData)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash"
  },
  argKeys: {
    to: "to",
    amount: "amount"
  },
  isDeposit: false
};

const constructParams = (chain: string) => {
  let eventParams = [] as any;

  const chainAddresses = contractAddresses[chain]
  const mos = chainAddresses.mosContract;
  const tokens = chainAddresses.tokens;

  // const finalMOSDepositParams = {
  //   ...tokenDepositParams,
  //   target: mos,
  //   fixedEventData: {
  //     to: mos
  //   }
  // };
  // const finalMOSWithdrawalParams = {
  //   ...tokenWithdrawalParams,
  //   target: mos,
  //   fixedEventData: {
  //     from: mos
  //   }
  // };
  // eventParams.push(finalMOSDepositParams, finalMOSWithdrawalParams);

  for (let token of Object.values(tokens)) {
    const finalTokenDepositParams = {
      ...tokenDepositParams,
      target: token,
      fixedEventData: {
        to: mos,
        token: token
      }
    };
    const finalTokenWithdrawalParams = {
      ...tokenWithdrawalParams,
      target: token,
      fixedEventData: {
        from: mos,
        token: token
      }
    };
    eventParams.push(finalTokenDepositParams, finalTokenWithdrawalParams);
  }

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("butternetwork", chain as Chain, fromBlock, toBlock, eventParams);
};


const adapter: BridgeAdapter = {
  bsc: constructParams("bsc"),
  polygon: constructParams("polygon"),
  ethereum: constructParams("ethereum"),
  map: constructParams("map")
};

export default adapter;

