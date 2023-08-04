import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

/*
Appears that native tokens cannot be bridged.
Can use transfer events for Ethereum.
For other chains, need to look at burnTokens, mintTokens, and TokensTransferred events.
Can only find a verified contract on BSC to reference.
Polygon appears to use a different contract with an extra function: 0x8a733e4c, can't find
this function called in any other contracts. It's only called by 'Gameverse', ignoring these txs.
*/

const contractAddresses = {
  ethereum: {
    "main_chain": "0x763a0ca93af05ade98a52dc1e5b936b89bf8b89a",
    "side_chain": "0xd02c8a355599fee7e4f1d1d71f7a01c0108e353c"
  },
  polygon: {
    "main_chain": "0xc07cd7fcda887119bff8e1eed2256ad433bee125",
    "side_chain": "0xf9ac9365a23d837f97078dad50638a12c9e256c8"
  },
  fantom: {
    "main_chain": "0xc30da5144d1b9f47ff86345fee14fe2da94c7203",
    "side_chain": "0x241663b6ae912f2a5dffdcb7a3550bf60c0a5df5"
  },
  avax: {
    "main_chain": "0x927f5f422bafd00df2ae817945b6e8694ad2f852",
    "side_chain": "0x241663b6ae912f2a5dffdcb7a3550bf60c0a5df5"
  },
  bsc: {
    "main_chain": "0x2cd90158baae285010a5ed7c549c2e5b4c0715f4",
    "side_chain": "0x5c80ae9c3396ca4394f9d8e6786ed9aa74489afe"
  },
  aurora: {
    "main_chain": null,
    "side_chain": "0xfb19add1db30a140915da55222ab5f968b32b900"
  }
} as { [chain: string]: any };


const depositParams: PartialContractEventParams = {
  target: "",
  topic: "TokensDeposited(address,address,uint256, uint256)",
  abi: ["event TokensDeposited(address tokenAddress, address issuer, uint256 amount, uint256 networkId)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "tokenAddress",
    from: "issuer",
    to: "issuer",
    amount: "amount"
  },
  txKeys: {
    from: "from",
  },
  fixedEventData: {
    to: "",
  },
  isDeposit: true,
};

const claimParams: PartialContractEventParams = {
  target: "",
  topic: "TokensDeposited(address,address, uint256)",
  abi: ["event TokensClaimed(address tokenAddress, address issuer, uint256 amount)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "tokenAddress",
    from: "issuer",
    to: "issuer",
    amount: "amount"
  },
  txKeys: {
    from: "from",
  },
  fixedEventData: {
    to: "",
  },
  isDeposit: false,
};

const burnParams: PartialContractEventParams = {
  target: "",
  topic: "TokensBurned(address,address,uint256)",
  abi: ["event TokensBurned(address tokenAddress, address issuer, uint256 amount)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "tokenAddress",
    from: "issuer",
    to: "issuer",
    amount: "amount"
  },
  txKeys: {
    from: "from",
  },
  fixedEventData: {
    to: "",
  },
  isDeposit: false,
};

const transferParams: PartialContractEventParams = {
  target: "",
  topic: "TokensTransferred(address,address,uint256,uint256)",
  abi: ["event TokensTransferred(address bridgeTokenAddress, address issuer, uint256 amount, uint256 networkId)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "bridgeTokenAddress",
    from: "issuer",
    to: "issuer",
    amount: "amount"
  },
  txKeys: {
    from: "from",
  },
  fixedEventData: {
    to: "",
  },
  isDeposit: false,
};

const nonEvmTransferParams: PartialContractEventParams = {
  target: "",
  topic: "NonEVMTokensTransferred(address,address,string,uint256,uint256)",
  abi: ["event NonEVMTokensTransferred(address bridgeTokenAddress, address issuer, string receiverAddress, uint256 amount, uint256 networkId)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "tokenAddress",
    from: "issuer",
    to: "receiverAddress",
    amount: "amount"
  },
  txKeys: {
    from: "from",
  },
  fixedEventData: {
    to: "",
  },
  isDeposit: false,
};


const nonEvmDepositParams: PartialContractEventParams = {
  target: "",
  topic: "NonEVMTokensDeposited(address,address,string,uint256,uint256)",
  abi: ["event NonEVMTokensDeposited(address bridgeTokenAddress, address issuer, string receiverAddress, uint256 amount, uint256 networkId)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "tokenAddress",
    from: "issuer",
    to: "receiverAddress",
    amount: "amount"
  },
  txKeys: {
    from: "from",
  },
  fixedEventData: {
    to: "",
  },
  isDeposit: true,
};


const tokensMintedParams: PartialContractEventParams = {
  target: "",
  topic: "TokensMinted(address,address,uint256)",
  abi: ["event TokensMinted(address tokenAddress, address issuer, uint256 amount)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "tokenAddress",
    from: "issuer",
    to: "issuer",
    amount: "amount"
  },
  inputDataExtraction: {
    inputDataABI: ["address", "address", "uint256", "uint256"],
    inputDataKeys: {
      to: "1",
    },
    useDefaultAbiEncoder: true, // the usual ABI wouldn't work for some reason
  },
  fixedEventData: {
    from: "",
  },
  isDeposit: false,
};

const constructParams = (chain: string) => {
  let eventParams = [] as any;
  const main_chain_address = contractAddresses[chain]["main_chain"];
  const side_chain_address = contractAddresses[chain]["side_chain"];

  const finalClaimParams = {
    ...claimParams,
    target: main_chain_address,
    fixedEventData: {
      to: main_chain_address,
    },
  };
  const finalDepositParams = {
    ...depositParams,
    target: main_chain_address,
    fixedEventData: {
      to: main_chain_address,
    },
  };
  const finalBurnParams = {
    ...burnParams,
    target: side_chain_address,
    fixedEventData: {
      to: side_chain_address,
    },
  };
  const finalTransferParams = {
    ...transferParams,
    target: side_chain_address,
    fixedEventData: {
      to: side_chain_address,
    },
  };
  const finalNonEvmTransferParams = {
    ...nonEvmTransferParams,
    target: side_chain_address,
    fixedEventData: {
      to: side_chain_address,
    },
  }
  const finalNonEvmDepositParams = {
    ...nonEvmDepositParams,
    target: main_chain_address,
    fixedEventData: {
      to: main_chain_address,
    },
  }
  const finalTokensMintedParams = {
    ...tokensMintedParams,
    target: side_chain_address,
    fixedEventData: {
      from: side_chain_address,
    },
  };
  eventParams.push(finalDepositParams, finalClaimParams, finalBurnParams, finalTransferParams, finalTokensMintedParams, finalNonEvmTransferParams, finalNonEvmDepositParams);

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("chainport", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  fantom: constructParams("fantom"),
  avalanche: constructParams("avax"),
  bsc: constructParams("bsc"),
  aurora: constructParams("aurora")
};

export default adapter;
