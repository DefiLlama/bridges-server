import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";

/*
Minter functions:
Swap(string fromChain, bytes fromAddr, bytes toAddr, address tokenAddress, bytes32[] bytes32s, uint[] uints, bytes data);
SwapRequest(string toChain, address fromAddr, bytes toAddr, bytes token, address tokenAddress, uint8 decimal, uint amount, uint depositId, bytes data);

Can see docs here: https://bridge-docs.orbitchain.io/

Adapter is finished for chains with a vault: Ethereum, BSC, (also on Klaytn).
Issue is that other chains have minter contracts, and there appears to be multiple (at least on Polygon).
It's difficult to find them all. On Avax and Fantom, have not found any addresses yet.
*/

const contractAddresses = {
  ethereum: {
    contract: "0x1Bf68A9d1EaEe7826b3593C20a0ca93293cb489a",
    nativeToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
  },
  polygon: {
    contract: "",
    nativeToken: "", // WMATIC
  },
  fantom: {
    contract: "",
    nativeToken: "", // WFTM
  },
  avax: {
    contract: "",
    nativeToken: "", // WAVAX
  },
  bsc: {
    contract: "0x89c527764f03BCb7dC469707B23b79C1D7Beb780",
    nativeToken: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
  },
} as {
  [chain: string]: {
    contract: string;
    nativeToken: string;
  };
};

// Using this only to filter for ETH txs, because it is has some problems for everything else:
// Atomic txs do not emit events, and some token addresses withdrawn are not actual token sent (e.g. DAI).
const ethDepositParams: PartialContractEventParams = {
  target: "",
  topic: "Deposit(string,address,bytes,address,uint8,uint256,uint256,bytes)",
  abi: [
    "event Deposit(string toChain, address fromAddr, bytes toAddr, address token, uint8 decimal, uint256 amount, uint256 depositId, bytes data)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "fromAddr",
    token: "token",
    amount: "amount",
  },
  fixedEventData: {
    to: "",
  },
  isDeposit: true,
  mapTokens: {
    "0x0000000000000000000000000000000000000000": "",
  },
  filter: {
    includeToken: [""],
  },
};

const ethWithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "Withdraw(string,bytes,bytes,bytes,bytes32[],uint256[],bytes)",
  abi: [
    "event Withdraw(string fromChain, bytes fromAddr, bytes toAddr, bytes token, bytes32[] bytes32s, uint256[] uints, bytes data)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "token",
    amount: "uints",
    to: "toAddr",
  },
  selectIndexesFromArrays: {
    amount: "0",
  },
  fixedEventData: {
    from: "",
  },
  mapTokens: {
    "0x0000000000000000000000000000000000000000": "",
  },
  filter: {
    includeToken: [""],
  },
  isDeposit: false,
};

const constructParams = (chain: string) => {
  let eventParams = [] as any;
  const chainAddress = contractAddresses[chain].contract;
  const nativeToken = contractAddresses[chain].nativeToken;
  const finalEthDepositParams = {
    ...ethDepositParams,
    target: chainAddress,
    fixedEventData: {
      to: chainAddress,
    },
    mapTokens: {
      "0x0000000000000000000000000000000000000000": nativeToken,
    },
    filter: {
      includeToken: [nativeToken],
    },
  };
  const finalEthWithdrawalParams = {
    ...ethWithdrawalParams,
    target: chainAddress,
    fixedEventData: {
      from: chainAddress,
    },
    mapTokens: {
      "0x0000000000000000000000000000000000000000": nativeToken,
    },
    filter: {
      includeToken: [nativeToken],
    },
  };
  const ercDepositParams = constructTransferParams(chainAddress, true);
  const ercWithdrawalParams = constructTransferParams(chainAddress, false);
  eventParams.push(finalEthDepositParams, finalEthWithdrawalParams, ercDepositParams, ercWithdrawalParams);
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("orbitbridge", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  //ethereum: constructParams("ethereum"),
  //polygon: constructParams("polygon"),
  //fantom: constructParams("fantom"),
  //avalanche: constructParams("avax"),
  //bsc: constructParams("bsc"),
};

export default adapter;
