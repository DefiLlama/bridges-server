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
const adapter: BridgeAdapter = {
  assetchain: constructParams("assetchain"),
};

export default adapter;