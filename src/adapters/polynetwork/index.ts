import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

/* 
Contract addresses are here: https://github.com/polynetwork/docs/blob/master/config/README.md
This use the 'lock proxy' contracts, could also use the 'poly wrapper' ones instead.
*/

const contractAddresses = {
  ethereum: {
    contract: "0x250e76987d838a75310c34bf422ea9f1AC4Cc906",
    nativeToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
  },
  polygon: {
    contract: "0x28FF66a1B95d7CAcf8eDED2e658f768F44841212",
    nativeToken: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
  },
  fantom: {
    contract: "0xd3b90E2603D265Bf46dBC788059AC12D52B6AC57",
    nativeToken: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",  // WFTM
  },
  avax: {
    contract: "0xd3b90E2603D265Bf46dBC788059AC12D52B6AC57",
    nativeToken: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", // WAVAX
  },
  bsc: {
    contract: "0x2f7ac9436ba4B548f9582af91CA1Ef02cd2F1f03",
    nativeToken: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
  },
  arbitrum: {
    contract: "0x2f7ac9436ba4B548f9582af91CA1Ef02cd2F1f03",
    nativeToken: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH
  },
  optimism: {
    contract: "0xd3b90E2603D265Bf46dBC788059AC12D52B6AC57",
    nativeToken: "0x4200000000000000000000000000000000000006", // WETH
  },
  xdai: {
    contract: "0x77F3A156e8E597C64d4a12d62f20a0d2ff839dD5",
    nativeToken: "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d", // WDAI
  },
  celo: {
    contract: "0x526444013Cd4D457212fF88Fe6F8e7c995DF1E40",
    nativeToken: "0x471EcE3750Da237f93B8E339c536989b8978a438" // CELO
  }
} as {
  [chain: string]: {
    contract: string;
    nativeToken: string;
  };
};

const ercDepositParams: PartialContractEventParams = {
  target: "",
  topic: "LockEvent(address,address,uint64,bytes,bytes,uint256)",
  abi: [
    "event LockEvent(address fromAssetHash, address fromAddress, uint64 toChainId, bytes toAssetHash, bytes toAddress, uint256 amount)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "fromAssetHash",
    amount: "amount",
  },
  txKeys: {
    from: "from"  // depositor is here, argKey only gives the Poly Wrapper address
  },
  fixedEventData: {
    to: "",
  },
  isDeposit: true,
  mapTokens: {
    "0x0000000000000000000000000000000000000000": "",
  },
};

const ercWithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "UnlockEvent(address,address,uint256)",
  abi: ["event UnlockEvent(address toAssetHash, address toAddress, uint256 amount)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "toAssetHash",
    amount: "amount",
    to: "toAddress",
  },
  fixedEventData: {
    from: "",
  },
  mapTokens: {
    "0x0000000000000000000000000000000000000000": "",
  },
  isDeposit: false,
};

const constructParams = (chain: string) => {
  let eventParams = [] as any;
  const chainAddress = contractAddresses[chain].contract;
  const nativeToken = contractAddresses[chain].nativeToken;
  const finalErcDepositParams = {
    ...ercDepositParams,
    target: chainAddress,
    fixedEventData: {
      to: chainAddress,
    },
    mapTokens: {
      "0x0000000000000000000000000000000000000000": nativeToken,
    },
  };
  const finalErcWithdrawalParams = {
    ...ercWithdrawalParams,
    target: chainAddress,
    fixedEventData: {
      from: chainAddress,
    },
    mapTokens: {
      "0x0000000000000000000000000000000000000000": nativeToken,
    },
  };
  eventParams.push(finalErcDepositParams, finalErcWithdrawalParams);
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("polynetwork", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  fantom: constructParams("fantom"),
  avalanche: constructParams("avax"),
  bsc: constructParams("bsc"),
  arbitrum: constructParams("arbitrum"),
  optimism: constructParams("optimism"),
  gnosis: constructParams("xdai"),
  celo: constructParams("celo")
};

export default adapter;
