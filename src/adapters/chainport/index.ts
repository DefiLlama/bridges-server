import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";

// Appears that native tokens cannot be bridged.
// Can use transfer events for Ethereum.
// For other chains, need to look at burnTokens, mintTokens, and TokensTransferred events.
// Can only find a verified contract on BSC to reference.
// Polygon appears to use a different contract with an extra function: 0x8a733e4c, can't find
// this function called in any other contracts. It's only called by 'Gameverse', ignoring these txs.

const contractAddresses = {
  ethereum: "0x763A0CA93AF05adE98A52dc1E5B936b89bF8b89a",
  polygon: "0xF9ac9365A23D837F97078DaD50638a12c9E256C8",
  fantom: "0x241663B6Ae912f2A5dFFDCb7a3550Bf60c0A5df5",
  avax: "0x241663B6Ae912f2A5dFFDCb7a3550Bf60c0A5df5",
  bsc: "0x5C80AE9c3396CA4394F9D8E6786Ed9aa74489afE",
} as { [chain: string]: any };

const burnDepositParams: PartialContractEventParams = {
  target: "",
  topic: "TokensBurned(address,address,uint256)",
  abi: ["event TokensBurned(address tokenAddress, address issuer, uint256 amount)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "tokenAddress",
    amount: "amount",
  },
  txKeys: {
    from: "from",
  },
  fixedEventData: {
    to: "",
  },
  isDeposit: true,
};

const transferDepositParams: PartialContractEventParams = {
  target: "",
  topic: "TokensTransferred(address,address,uint256,uint256)",
  abi: ["event TokensTransferred(address bridgeTokenAddress, address issuer, uint256 amount, uint256 networkId)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "bridgeTokenAddress",
    amount: "amount",
  },
  txKeys: {
    from: "from",
  },
  fixedEventData: {
    to: "",
  },
  isDeposit: true,
};

const withdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "TokensMinted(address,address,uint256)",
  abi: ["event TokensMinted(address tokenAddress, address issuer, uint256 amount)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "tokenAddress",
    amount: "amount",
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
  const chainAddress = contractAddresses[chain];
  if (chain === "ethereum") {
    const finalDepositParams = constructTransferParams(chainAddress, true);
    const finalWithdrawalParams = constructTransferParams(chainAddress, false);
    eventParams.push(finalDepositParams, finalWithdrawalParams);
  } else {
    const finalBurnDepositParams = {
      ...burnDepositParams,
      target: chainAddress,
      fixedEventData: {
        to: chainAddress,
      },
    };
    const finalTransferDepositParams = {
      ...transferDepositParams,
      target: chainAddress,
      fixedEventData: {
        to: chainAddress,
      },
    };
    const finalWithdrawalParams = {
      ...withdrawalParams,
      target: chainAddress,
      fixedEventData: {
        from: chainAddress,
      },
    };
    eventParams.push(finalBurnDepositParams, finalTransferDepositParams, finalWithdrawalParams);
  }
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("chainport", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  fantom: constructParams("fantom"),
  avalanche: constructParams("avax"),
  bsc: constructParams("bsc"),
};

export default adapter;
