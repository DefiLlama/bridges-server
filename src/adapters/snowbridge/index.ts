import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const contractAddresses = {
  ethereum: {
    gateway: "0x27ca963c279c93801941e1eb8799c23f407d68e7", // Gateway address
    agent: "0xd803472c47a87d7b63e888de53f03b4191b846a8", // Agent address
    tokens: [
      {
        token: "0xba41ddf06b7ffd89d1267b5a93bfef2424eb2003", // MYTH
      },
      {
        token: "0x18084fba666a33d37592fa2633fd49a74dd93a88", // tBTC v2
      },
    ],
  },
} as {
  [chain: string]: {
    gateway?: string;
    agent?: string;
    tokens: { token: string }[];
  };
};

const depositParams: PartialContractEventParams = {
  target: "",
  topic: "Transfer(address,address,uint256)",
  abi: ["event Transfer(address indexed src, address indexed dst, uint256 wad)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "wad",
    from: "src",
  },
  fixedEventData: {
    token: "",
    to: "",
  },
  isDeposit: true,
};

const withdrawalParams: PartialContractEventParams = {
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
};

// Step 5: Construct event parameters for your chain
const constructParams = (chain: string) => {
  let eventParams: PartialContractEventParams[] = [];

  const contractAddressesForChain = contractAddresses[chain];
  const agent = contractAddressesForChain?.agent;
  const tokens = contractAddressesForChain?.tokens || [];

  tokens.map(({ token }) => {
    const tokenDepositParams: PartialContractEventParams = {
      ...depositParams,
      target: token,
      fixedEventData: {
        token: token,
        to: agent,
      },
    };
    const tokenWithdrawalParams: PartialContractEventParams = {
      ...tokenDepositParams,
      target: token,
      isDeposit: false,
      fixedEventData: {
        token: token,
        from: agent,
      },
    };
    eventParams.push(tokenDepositParams, tokenWithdrawalParams);
  });

  // Return a function to fetch transaction data from event logs
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("snowbridge", chain as Chain, fromBlock, toBlock, eventParams);
};

// Step 6: Export the adapter
const adapter: BridgeAdapter = Object.fromEntries(
  Object.keys(contractAddresses).map((chain) => [chain, constructParams(chain)])
);

export default adapter;
