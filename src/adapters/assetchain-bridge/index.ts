import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { ethers } from "ethers";

const nullAddress = "0x0000000000000000000000000000000000000000";

// Step 1: Define contract addresses for your chain
const contractAddresses = {
  assetchain: {
    tokens: [
      {
        token: "0x2B7C1342Cc64add10B2a79C8f9767d2667DE64B2", // USDC
        bridgeContract: "0xA6c8B33edD4894E42d0C5585fEC52aAC6FF9147d",
      },
      {
        token: "0xDBDc8c7B96286899aB624F6a59dd0250DD4Ce9bC", // BTC
        bridgeContract: "0x08d4a11Fb4fFE7022deBbBbcBb7444005B09a2FC",
      },
      {
        token: "0x26E490d30e73c36800788DC6d6315946C4BbEa24", // USDT
        bridgeContract: "0x196434734f09DFE6D479b5a248a45cfbe516382a",
      },
      {
        token: "0xEc6943BB984AED25eC96986898721a7f8aB6212E", // WNT
        bridgeContract: "0x8D03A4E2dBfbf13043Bde6278658EFfCE6FE6b02",
      },
    ],
  },
  bsc: {
    tokens: [
      {
        token: "0x0FFE2dA242E959a7446Abb56A8f2626D0DC4fce7", // USDT
        bridgeContract: "0x55d398326f99059fF775485246999027B3197955",
      },
    ],
  },
  arbitrum: {
    tokens: [
      {
        token: "0x0FFE2dA242E959a7446Abb56A8f2626D0DC4fce7", // WNT
        bridgeContract: "0xAD4b9c1FbF4923061814dD9d5732EB703FaA53D4",
      },
      {
        token: "0x5116990d844bda038DBD037D943FcB7481b5Fee7", // RWA
        bridgeContract: "0x3096e7BFd0878Cc65be71f8899Bc4CFB57187Ba3",
      },
      {
        token: "0x6377C8cC083d7CEB49fD3eE1244351BFB86C961e", // WETH
        bridgeContract: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      },
      {
        token: "0x475d2Ff7955c5359D31B19DC275be3a466f035D5", // USDT
        bridgeContract: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      },
    ],
  },
  base: {
    tokens: [
      {
        token: "0x5E007f834b6Ee2fcdA41631AD444b4dAAEc372b0", // USDC
        bridgeContract: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      },
      {
        token: "0xEd87e9170152A12a4D3904F5cdE323b35d880858", // WETH
        bridgeContract: "0x4200000000000000000000000000000000000006",
      },
    ],
  },
  ethereum: {
    tokens: [
      {
        token: "0x85FCf4D25895Eeb5306643777F1205331415F51a", // USDC
        bridgeContract: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      },
      {
        token: "0x26fa2991f15473B3502D767b49e5805753b8F7F8", // USDT
        bridgeContract: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      },
      {
        token: "0x1B2322a56f43DBDcB19fcd97527EeB734EEeD119", // WETH
        bridgeContract: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      },
      {
        token: "0xc415231cc96d20d99248706403B7580bE560c140", // WBTC
        bridgeContract: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      },
    ],
  },
} as {
  [chain: string]: {
    bridgeToken?: string;
    tokens: { token: string; bridgeContract: string }[];
    nativeToken?: string;
    bridgeVault?: string;
  };
};

/* // Step 2: Define event parameters for native token bridging
const nativeDepositParams: PartialContractEventParams = {
    target: "",
    topic: "Transfer(address,address,uint256)",
    abi: ["event Transfer(address indexed src, address indexed dst, uint256 wad)"],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      amount: "wad",
    },
    txKeys: {
      from: "from",
    },
    fixedEventData: {
      token: "",
      to: "",
    },
    isDeposit: true,
  };
  
  const nativeWithdrawalParams: PartialContractEventParams = {
    target: "",
    topic: "Transfer(address,address,uint256)",
    abi: ["event Transfer(address indexed src, address indexed dst, uint256 wad)"],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      amount: "wad",
      to: "dst",
    },
    fixedEventData: {
      token: "",
      from: "",
    },
    isDeposit: false,
  }; */



/* // Step 3: Define event parameters for bridge token (e.g., your protocol's token)
const bridgeTokenDepositParams: PartialContractEventParams = {
    target: "",
    topic: "Transfer(address,address,uint256)",
    topics: [ethers.utils.id("Transfer(address,address,uint256)"), null, ethers.utils.hexZeroPad(nullAddress, 32)],
    abi: ["event Transfer(address indexed from, address indexed to, uint256 value)"],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      from: "from",
      amount: "value",
    },
    fixedEventData: {
      token: "",
    },
    isDeposit: true,
  };
  
  const bridgeTokenWithdrawalParams: PartialContractEventParams = {
    target: "",
    topic: "Transfer(address,address,uint256)",
    topics: [ethers.utils.id("Transfer(address,address,uint256)"), ethers.utils.hexZeroPad(nullAddress, 32)],
    abi: ["event Transfer(address indexed from, address indexed to, uint256 value)"],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      to: "to",
      amount: "value",
    },
    fixedEventData: {
      token: "",
      from: "",
    },
    isDeposit: false,
  }; */

// Step 4: Define event parameters for ERC-20 token bridging
const ercDepositParams: PartialContractEventParams = {
  target: "",
  topic: "FulfilledTokens(string,address,string,string,uint256,uint256)", 
  abi: ["event FulfilledTokens(string indexed fromUser, address indexed toUser, string fromChain, string toChain, uint256 amount, uint256 exchangeRate)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "fromUser",
    amount: "amount",
  },
  fixedEventData: {
    token: "",
    to: "",
  },
  argGetters: {
    from: (args: any) => {
      const fromUser = args[0]?.hash;
      if (!fromUser || typeof fromUser !== "string") {
        throw new Error(`Invalid fromUser: ${fromUser}`);
      }
      return fromUser;
    },
    to: (args: any) => {
      const toUser = args[1]; // Address
      if (!toUser || typeof toUser !== "string") {
        throw new Error(`Invalid toUser: ${toUser}`);
      }
      return toUser;
    },
    amount: (args: any) => {
      const amount = args[4]; // BigNumber
      return amount;
    },
  },
  isDeposit: true,
};

const ercWithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "SentTokens(address,string,string,string,uint256,uint256)",
  abi: ["event SentTokens(address fromUser, string indexed toUser, string fromChain, string toChain, uint256 amount, uint256 exchangeRate)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "fromUser",
    amount: "amount",
    to: "toUser",
  },
  fixedEventData: {
    token: "",
  },
  argGetters: {
    from: (args: any) => {
      const fromUser = args[0]; // Address
      if (!fromUser || typeof fromUser !== "string") {
        throw new Error(`Invalid fromUser: ${fromUser}`);
      }
      return fromUser;
    },
    to: (args: any) => {
      const toUser = args[1]?.hash;
      if (!toUser || typeof toUser !== "string") {
        throw new Error(`Invalid toUser: ${toUser}`);
      }
      return toUser;
    },
    amount: (args: any) => {
      const amount = args[4]; // BigNumber
      return amount;
    },
  },

  isDeposit: false,
};


// Step 5: Construct event parameters for your chain
const constructParams = (chain: string) => {
  let eventParams: PartialContractEventParams[] = [];

  const contractAddressesForChain = contractAddresses[chain];
  const bridgeVault = contractAddressesForChain?.bridgeVault;
  const nativeToken = contractAddressesForChain?.nativeToken;
  // const ercs = contractAddressesForChain?.ercs || [];
  const bridgeToken = contractAddressesForChain?.bridgeToken;
  // const bridgeContract = contractAddressesForChain?.bridgeContract;
  const tokens = contractAddressesForChain?.tokens || [];

  // Native token bridging (e.g., MyChain's native token)
  /* if (bridgeVault && nativeToken) {
    const finalNativeDepositParams: PartialContractEventParams = {
      ...nativeDepositParams,
      target: bridgeVault,
      fixedEventData: {
        token: nativeToken,
        to: bridgeVault,
      },
    };
    const finalNativeWithdrawalParams: PartialContractEventParams = {
      ...nativeWithdrawalParams,
      target: bridgeVault,
      fixedEventData: {
        token: nativeToken,
        from: bridgeVault,
      },
    };
    eventParams.push(finalNativeDepositParams, finalNativeWithdrawalParams);
  } */

  // Bridge token bridging (e.g., your protocol's token)
  /*  if (bridgeToken) {
     const finalBridgeTokenDepositParams: PartialContractEventParams = {
       ...bridgeTokenDepositParams,
       target: bridgeToken,
       fixedEventData: {
         token: bridgeToken,
         to: bridgeToken,
       },
     };
     const finalBridgeTokenWithdrawalParams: PartialContractEventParams = {
       ...bridgeTokenWithdrawalParams,
       target: bridgeToken,
       fixedEventData: {
         token: bridgeToken,
         from: bridgeToken,
       },
     };
     eventParams.push(finalBridgeTokenDepositParams, finalBridgeTokenWithdrawalParams);
   } */

  // ERC-20 token bridging
  for (let { token, bridgeContract } of tokens) {
    const finalErcDepositParams: PartialContractEventParams = {
      ...ercDepositParams,
      target: bridgeContract, // Bridge contract for this token
      fixedEventData: {
        token: token, // ERC-20 token
        to: bridgeContract, // Bridge contract as recipient
      },
    };
    const finalErcWithdrawalParams: PartialContractEventParams = {
      ...ercWithdrawalParams,
      target: bridgeContract, // Bridge contract for this token
      fixedEventData: {
        token: token, // ERC-20 token
        from: bridgeContract, // Bridge contract as sender
      },
    };
    eventParams.push(
      finalErcDepositParams, 
      finalErcWithdrawalParams);
  }

  // Return a function to fetch transaction data from event logs
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("assetchainbridge", chain as Chain, fromBlock, toBlock, eventParams);
};

// Step 6: Export the adapter
const adapter: BridgeAdapter = Object.fromEntries(
  Object.keys(contractAddresses).map((chain) => [chain, constructParams(chain)])
);

export default adapter;