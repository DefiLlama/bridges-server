import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const contractAddresses = {
  ethereum: {
    mosContract: "0x92e929d8b2c8430bcaf4cd87654789578bb2b786",
    tokens: {
      ETH: "0x0000000000000000000000000000000000000000",
      USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      DAI: "0x6b175474e89094c44da98b954eedeac495271d0f",
      BUSD: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
      WBTC: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      AAVE: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
      HT: "0x6f259637dcd74c767781e37bc6133cd6a68aa161",
      PEPE: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
      WLD: "0x163f8C2467924be0ae7B5347228CABF260318753",
    }
  },
  bsc: {
    mosContract: "0x1ed5685f345b2fa564ea4a670de1fde39e484751",
    tokens: {
      BNB: "0x0000000000000000000000000000000000000000",
      BUSD: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
      USDC: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
      USDT: "0x55d398326f99059ff775485246999027b3197955",
      DAI: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
      WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      BTCB: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
      ETH: "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
      DOGE: "0xba2ae424d960c26247dd6c32edc70b295c744c43",
    }
  },
  heco: {
    mosContract: "0xaeAE2CBb1E024E27e80cc61eE9A8B300282209B4",
    tokens: {
      HT: "0x0000000000000000000000000000000000000000",
      USDC: "0x9362bbef4b8313a8aa9f0c9808b80577aa26b73b",
      USDT: "0xa71edc38d189767582c38a3145b5873052c3e47a",
      HUSD: "0x0298c2b32eae4da002a15f36fdf7615bea3da047",
      ETH: "0x64ff637fb478863b7468bc97d30a5bf3a428a1fd",
    }
  },
  okexchain: {
    mosContract: "0x37809F06F0Daf8f1614e8a31076C9bbEF4992Ff9",
    tokens: {
      OKT: "0x0000000000000000000000000000000000000000",
      USDC: "0xc946daf81b08146b1c7a8da2a851ddf2b3eaaf85",
      USDT: "0x382bb369d343125bfb2117af9c149795c6c65c50",
      ETH: "0xef71ca2ee68f45b9ad6f72fbdb33d707b872315c",
      OKB: "0xdf54b6c6195ea4d948d03bfd818d365cf175cfc2",
    }
  },
  polygon: {
    mosContract: "0x242Ea2A8C4a3377A738ed8a0d8cC0Fe8B4D6C36E",
    tokens: {
      MATIC: "0x0000000000000000000000000000000000000000",
      USDC: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
      USDT: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
      WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      DAI: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    }
  },
  fantom: {
    mosContract: "0x8f957ed3f969d7b6e5d6df81e61a5ff45f594dd1",
    tokens: {
      FTM: "0x0000000000000000000000000000000000000000",
      USDC: "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
      USDT: "0x049d68029688eabf473097a2fc38ef61633a3c7a",
      DAI: "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e",
      WETH: "0x74b23882a30290451A17c44f4F05243b6b58C76d",
    }
  },
  arbitrum: {
    mosContract: "0x8f957ed3f969d7b6e5d6df81e61a5ff45f594dd1",
    tokens: {
      ETH: "0x0000000000000000000000000000000000000000",
      ARB: "0x912ce59144191c1204e64559fe8253a0e49e6548",
      USDC_CIRCLE: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      USDC: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
      USDT: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
    }
  },
  base: {
    mosContract: "0xa18968cc31232724f1dbd0d1e8d0b323d89f3501",
    tokens: {
      ETH: "0x0000000000000000000000000000000000000000",
      WETH: "0x4200000000000000000000000000000000000006",
      USDT: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
      USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    }
  },
  era: {
    mosContract: "0x2042ecdc71f9ffb2eb9cda7f801eccc5c6c8b7eb",
    tokens: {
      ETH: "0x0000000000000000000000000000000000000000",
      USDT: "0x493257fD37EDB34451f62EDf8D2a0C418852bA4C",
      USDC: "0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4",
    }
  },
  linea: {
    mosContract: "0x8159891dfe9de7fc3bf1b665eb1adda60f2acd0e",
    tokens: {
      ETH: "0x0000000000000000000000000000000000000000",
      USDT: "0xA219439258ca9da29E9Cc4cE5596924745e12B93",
      USDC: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff",
    }
  },
  optimism: {
    mosContract: "0x8f957ed3f969d7b6e5d6df81e61a5ff45f594dd1",
    tokens: {
      ETH: "0x0000000000000000000000000000000000000000",
      OP: "0x4200000000000000000000000000000000000042",
      USDC_CIRCLE: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      USDT: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
      USDC: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
    }
  },
  avax: {
    mosContract: "0x8f957ed3f969d7b6e5d6df81e61a5ff45f594dd1",
    tokens: {
      AVAX: "0x0000000000000000000000000000000000000000",
      USDt: "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7",
      USDC: "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
      USDT_e: "0xc7198437980c041c805a1edcba50c1ce5db95118",
      USDC_e: "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664",
      DAI: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
      ETH: '0xf20d962a6c8f70c731bd838a3a388d7d48fa6e15',
    }
  },
  tron: {
    mosContract: "TEorZTZ5MHx8SrvsYs1R3Ds5WvY1pVoMSA",
    tokens: {
      TRX: "0x0000000000000000000000000000000000000000",
      USDT: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
      USDC: "TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8",
      USDD: "TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn",
      BUSD: "TMz2SWatiAtZVVcH2ebpsbVtYwUPT9EdjH",
      TUSD: "TUpMhErZL2fhh4sVNULAbNKLokS4GjC1F4",
      USDJ: "TMwFHYXLJaRUPeW6421aqXL4ZEzPRFGkGT",
      BTT: "TAFjULxiVgT4qWk6UZwjqwZXTSaGaqnVp4",
      JST: "TCFLL5dx5ZJdKnWuesXxi1VPwjLVmWZZy9",
    }
  },

} as {
  [chain: string]: {
    mosContract: string;
    tokens: {};
  };
};

const tokenDepositParams: PartialContractEventParams = {
  target: "",
  topic: "Swap(address, string, address, string, uint256, uint256)",
  abi: [
    "event Swap(address fromToken, string toToken, address sender, string destination, uint256 fromAmount, uint256 minReturnAmount)"
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash"
  },
  argKeys: {
    from: "sender",
    to: "destination",
    token: "fromToken",
    amount: "fromAmount"
  },
  isDeposit: true
};

const nativeTokenDepositParams: PartialContractEventParams = {
  target: "",
  topic: "SwapEth(string, address, string, uint256, uint256)",
  abi: [
    "event SwapEth(string toToken, address sender, string destination, uint256 fromAmount, uint256 minReturnAmount)"
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash"
  },
  argKeys: {
    from: "sender",
    to: "destination",
    amount: "fromAmount"
  },
  isDeposit: true
};

const tokenWithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "Withdtraw(address, uint256)",
  abi: ["event Withdtraw(address token, uint256 amount)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash"
  },
  argKeys: {
    token: "token",
    amount: "amount"
  },
  isDeposit: false
};

const nativeTokenWithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "WithdrawETH(uint256)",
  abi: ["event WithdrawETH(uint256 amount)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash"
  },
  argKeys: {
    amount: "amount"
  },
  isDeposit: false
};

const constructParams = (chain: string) => {
  let eventParams = [] as any;

  const chainAddresses = contractAddresses[chain]
  const mos = chainAddresses.mosContract;
  const tokens = chainAddresses.tokens;

  for (let token of Object.values(tokens)) {
    const finalTokenDepositParams = {
      ...tokenDepositParams,
      target: mos,
      fixedEventData: {
        to: mos,
        token: token
      }
    };
    const finalTokenWithdrawalParams = {
      ...tokenWithdrawalParams,
      target: mos,
      fixedEventData: {
        from: mos,
        token: token
      }
    };
    eventParams.push(finalTokenDepositParams, finalTokenWithdrawalParams);

    const finalNativeTokenDepositParams = {
      ...nativeTokenDepositParams,
      target: mos,
      fixedEventData: {
        to: mos,
        token: token
      }
    };
    const finalNativeTokenWithdrawalParams = {
      ...nativeTokenWithdrawalParams,
      target: mos,
      fixedEventData: {
        from: mos,
        token: token
      }
    };
    eventParams.push(finalNativeTokenDepositParams, finalNativeTokenWithdrawalParams);
  }

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("bridgers", chain as Chain, fromBlock, toBlock, eventParams);
};


const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  bsc: constructParams("bsc"),
  heco: constructParams("heco"),
  okexchain: constructParams("okexchain"),
  polygon: constructParams("polygon"),
  fantom: constructParams("fantom"),
  arbitrum: constructParams("arbitrum"),
  base: constructParams("base"),
  era: constructParams("era"),
  linea: constructParams("linea"),
  optimism: constructParams("optimism"),
  avax: constructParams("avax"),
  tron: constructParams("tron")
};

export default adapter;

