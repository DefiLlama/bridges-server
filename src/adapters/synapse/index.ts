import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, ContractEventParams, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

// Synapse Bridge Contracts on all supported chains
const contractAddresses = {
  arbitrum: {
      synapseBridge: "0x6F4e8eBa4D337f874Ab57478AcC2Cb5BACdc19c9",
      synapseRFQ: "0x5523D3c98809DdDB82C686E152F5C58B1B0fB59E",
  },
  aurora: {
      synapseBridge: "0xaeD5b25BE1c3163c907a471082640450F928DDFE",
  },
  avax: {
      synapseBridge: "0xC05e61d0E7a63D27546389B7aD62FdFf5A91aACE",
  },
  boba: {
      synapseBridge: "0x432036208d2717394d2614d6697c46DF3Ed69540",
  },
  bsc: {
      synapseBridge: "0xd123f70AE324d34A9E76b67a27bf77593bA8749f",
  },
  canto: {
      synapseBridge: "0xDde5BEC4815E1CeCf336fb973Ca578e8D83606E0",
  },
  cronos: {
      synapseBridge: "0xE27BFf97CE92C3e1Ff7AA9f86781FDd6D48F5eE9",
  },
  dfk: {
      synapseBridge: "0xE05c976d3f045D0E6E7A6f61083d98A15603cF6A",
  },
  dogechain: {
      synapseBridge: "0x9508BF380c1e6f751D97604732eF1Bae6673f299",
  },
  ethereum: {
      synapseBridge: "0x2796317b0fF8538F253012862c06787Adfb8cEb6",
      synapseRFQ: "0x5523D3c98809DdDB82C686E152F5C58B1B0fB59E",
  },
  fantom: {
      synapseBridge: "0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b",
  },
  harmony: {
      synapseBridge: "0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b",
  },
  moonriver: {
      synapseBridge: "0xaeD5b25BE1c3163c907a471082640450F928DDFE",
  },
  moonbeam: {
      synapseBridge: "0x84A420459cd31C3c34583F67E0f0fB191067D32f",
  },
  optimism: {
      synapseBridge: "0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b",
      synapseRFQ: "0x5523D3c98809DdDB82C686E152F5C58B1B0fB59E",
  },
  polygon: {
      synapseBridge: "0x8F5BBB2BB8c2Ee94639E55d5F41de9b4839C1280",
  },
  metis: {
      synapseBridge: "0x06Fea8513FF03a0d3f61324da709D4cf06F42A5c",
  },
  klaytn: {
      synapseBridge: "0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b",
  },
  base: {
    synapseBridge: "0xf07d1C752fAb503E47FEF309bf14fbDD3E867089",
    synapseRFQ: "0x5523D3c98809DdDB82C686E152F5C58B1B0fB59E"
  },
  blast: {
    synapseBridge:"0x55769baf6ec39b3bf4aae948eb890ea33307ef3c",
  }
}  as {
    [chain: string]: {
        synapseBridge: string;
        synapseRFQ?: string;
    };
  };


//Partial Contract Event parameters for each relevant event on the Synapse Bridge Contracts
  

  const TokenDepositDepositParams: PartialContractEventParams = {
    target: "",
    //Using "address" instead of "contract" in topic and abi because code fails without this
    topic:"TokenDeposit(address,uint256,address,uint256)",
    abi: ["event TokenDeposit(address indexed to, uint256 chainId, address token, uint256 amount)"],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
      from: "address",
    },
    argKeys: {
      amount: "amount",
      token: "token",
      to: "to",
    },
    isDeposit: true,
  };

  const TokenDepositAndSwapDepositParams: PartialContractEventParams = {
    target: "",
    topic:"TokenDepositAndSwap(address,uint256,contract,uint256,uint8,uint8,uint256,uint256)",
    abi: [
      "event TokenDepositAndSwap(address indexed to, uint256 chainId, address token, uint256 amount, uint8 tokenIndexFrom, uint8 tokenIndexTo, uint256 minDy, uint256 deadline)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
      from: "address",
    },
    argKeys: {
      amount: "amount",
      token: "token",
      to: "to",
    },
    isDeposit: true,
  };

  const TokenRedeemDepositParams: PartialContractEventParams = {
    target: "",
    topic: "TokenRedeem(address,uint256,address,uint256)",
    abi: ["event TokenRedeem(address indexed to, uint256 chainId, address token, uint256 amount)",],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
      from: "address",
    },
    argKeys: {
      amount: "amount",
      token: "token",
      to: "to",
    },
    isDeposit: true,
  };

  const TokenRedeemAndRemoveDepositParams: PartialContractEventParams = {
    target: "",
    topic:"TokenRedeemAndRemove(address,uint256,address,uint256,uint8,uint256,uint256)",
    abi: [
      "event TokenRedeemAndRemove(address indexed to, uint256 chainId, address token, uint256 amount, uint8 swapTokenIndex, uint256 swapMinAmount, uint256 swapDeadline)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
      from: "address",
    },
    argKeys: {
      amount: "amount",
      token: "token",
      to: "to",
    },
    isDeposit: true,
  };

  const TokenRedeemAndSwapDepositParams: PartialContractEventParams = {
    target: "",
    topic:"TokenRedeemAndSwap(address,uint256,address,uint256,uint8,uint8,uint256,uint256)",
    abi: [
      "event TokenRedeemAndSwap(address indexed to, uint256 chainId, address token, uint256 amount, uint8 tokenIndexFrom, uint8 tokenIndexTo, uint256 minDy, uint256 deadline)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
      from: "address",
    },
    argKeys: {
      amount: "amount",
      token: "token",
      to: "to",
    },
    isDeposit: true,
  };

  const TokenRedeemV2DepositParams: PartialContractEventParams = {
    target: "",
    topic:"TokenRedeemV2(bytes32,uint256,address,uint256)",
    abi: [
      "event TokenRedeemV2(bytes32 indexed to, uint256 chainId, address token, uint256 amount)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
      from: "address",
    },    
    argKeys: {
      amount: "amount",
      token: "token",
      to: "to",
    },
    isDeposit: true,
  };

// //Begin outlining the withdraws
const TokenWithdrawWithdrawParams: PartialContractEventParams = {
    target: "",
    topic:"TokenWithdraw(address,address,uint256,uint256,bytes32)",
    abi: [
      "event TokenWithdraw(address indexed to, address token, uint256 amount, uint256 fee, bytes32 indexed kappa)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
      from: "address",
    },
    argKeys: {
      amount: "amount",
      token: "token",
      to: "to",
    },
    isDeposit: false,
  };

  const TokenWithdrawAndRemoveWithdrawParams: PartialContractEventParams = {
    target: "",
    topic:"TokenWithdrawAndRemove(address,address,uint256,uint256,uint8,uint256,uint256,bool,bytes32)",
    abi: [
      "event TokenWithdrawAndRemove(address indexed to, address token, uint256 amount, uint256 fee, uint8 swapTokenIndex, uint256 swapMinAmount, uint256 swapDeadline, bool swapSuccess, bytes32 indexed kappa)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
      from: "address",
    },
    argKeys: {
      amount: "amount",
      token: "token",
      to: "to",
    },
    isDeposit: false,
  };

  const TokenMintWithdrawParams: PartialContractEventParams = {
    target: "",
    topic:"TokenMint(address,address,uint256,uint256,bytes32)",
    abi: [
      "event TokenMint(address indexed to, address token, uint256 amount, uint256 fee, bytes32 indexed kappa)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
      from: "address",
    },
    argKeys: {
      amount: "amount",
      token: "token",
      to: "to",
    },
    isDeposit: false,
  };

  const TokenMintAndSwapWithdrawParams: PartialContractEventParams = {
    target: "",
    topic:"TokenMintAndSwap(address,address,uint256,uint256,uint8,uint8,uint256,uint256,bool,bytes32)",
    abi: [
      "event TokenMintAndSwap(address indexed to, address token, uint256 amount, uint256 fee, uint8 tokenIndexFrom, uint8 tokenIndexTo, uint256 minDy, uint256 deadline, bool swapSuccess, bytes32 indexed kappa)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
      from: "address",
    },
    argKeys: {
      amount: "amount",
      token: "token",
      to: "to",
    },
    isDeposit: false,
  };




  // RFQ Deposits
  const RFQBridgeRequestedParams: PartialContractEventParams = {
    target: "",
    topic: "BridgeRequested(bytes32,address,bytes,uint32,address,address,uint256,uint256,bool)",
    abi: [
      "event BridgeRequested(bytes32 indexed transactionId, address indexed sender, bytes request, uint32 destChainId, address originToken, address destToken, uint256 originAmount, uint256 destAmount, bool sendChainGas)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
      from: "address",
    },
    argKeys: {
      amount: "originAmount",
      token: "originToken",
      to: "sender"
    },
    isDeposit: true, 
  };

  // RFQ Withdraws
  const RFQBridgeRelayedParams: PartialContractEventParams = {
    target: "",
    topic: "BridgeRelayed(bytes32,address,address,uint32,address,address,uint256,uint256,uint256)",
    abi: [
      "event BridgeRelayed(bytes32 indexed transactionId, address indexed relayer, address indexed to, uint32 originChainId, address originToken, address destToken, uint256 originAmount, uint256 destAmount, uint256 chainGasAmount)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
      from: "address",
    },
    argKeys: {
      amount: "destAmount",
      token: "destToken",
      to: "relayer"
    },
    isDeposit: false, 
  };



//Add all partial events to eventParams

const constructParams = (chain:string) => {

    const { synapseBridge = '', synapseRFQ = null } = contractAddresses[chain];
    //Deposits:
    const finalTokenDepositDepositParams = {
        ...TokenDepositDepositParams,
        target: synapseBridge
    }
    const finalTokenDepositAndSwapDepositParams = {
        ...TokenDepositAndSwapDepositParams,
        target: synapseBridge
    }
    const finalTokenRedeemDepositParams = {
        ...TokenRedeemDepositParams,
        target: synapseBridge
    }
    const finalTokenRedeemAndSwapDepositParams = {
        ...TokenRedeemAndSwapDepositParams,
        target: synapseBridge
    }
    const finalTokenRedeemAndRemoveDepositParams = {
        ...TokenRedeemAndRemoveDepositParams,
        target: synapseBridge
    }
    const finalTokenRedeemV2DepositParams = {
        ...TokenRedeemV2DepositParams,
        target: synapseBridge
    }
    const finalRFQBridgeRequestedParams = {
      ...RFQBridgeRequestedParams, 
      target: synapseRFQ || synapseBridge
    }
  
    // Withdraws
    const finalTokenWithdrawWithdrawParams = {
        ...TokenWithdrawWithdrawParams,
        target: synapseBridge
    }
    const finalTokenWithdrawAndRemoveWithdrawParams = {
        ...TokenWithdrawAndRemoveWithdrawParams,
        target: synapseBridge
    }
    const finalTokenMintWithdrawParams = {
        ...TokenMintWithdrawParams,
        target: synapseBridge
    }
    const finalTokenMintAndSwapWithdrawParams = {
        ...TokenMintAndSwapWithdrawParams,
        target: synapseBridge
    }
    const finalRFQBridgeRelayedParams = {
      ...RFQBridgeRelayedParams,
      target: synapseRFQ || synapseBridge
    }


    const eventParams = [
        finalTokenDepositDepositParams,
        finalTokenDepositAndSwapDepositParams,
        finalTokenRedeemDepositParams,
        finalTokenRedeemAndSwapDepositParams,
        finalTokenRedeemAndRemoveDepositParams,
        finalTokenRedeemV2DepositParams,
        finalTokenWithdrawWithdrawParams,
        finalTokenWithdrawAndRemoveWithdrawParams,
        finalTokenMintWithdrawParams,
        finalTokenMintAndSwapWithdrawParams,
        finalRFQBridgeRequestedParams,
        finalRFQBridgeRelayedParams,
    ]

    return async (fromBlock: number, toBlock: number) =>
        getTxDataFromEVMEventLogs("synapse", chain as Chain, fromBlock, toBlock, eventParams);

}

const adapter: BridgeAdapter = {
  arbitrum: constructParams("arbitrum"),
  aurora: constructParams("aurora"),
  avalanche: constructParams("avax"),
  bsc: constructParams("bsc"),
  ethereum: constructParams("ethereum"),
  fantom: constructParams("fantom"),
  // harmony: constructParams("harmony"),
  moonriver: constructParams("moonriver"),
  moonbeam: constructParams("moonbeam"),
  optimism: constructParams("optimism"),
  polygon: constructParams("polygon"),
  // // klaytn: constructParams("klaytn"),
  base: constructParams("base"),
  metis: constructParams("metis"),
  blast: constructParams("blast"),
  // dfk: constructParams("dfk"),
  // boba: constructParams("boba"),
  // // canto: constructParams("canto"),
  // cronos: constructParams("cronos"),
  // dogechain: constructParams("dogechain"),
};


  export default adapter;



// npm run test synapse 1704662099 1704903299