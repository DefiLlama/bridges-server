import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";
import { BigNumber } from "ethers";

const contractAddresses = {
  ethereum: {
    gateway: "0x27ca963c279c93801941e1eb8799c23f407d68e7", // Gateway address
    agent: "0xd803472c47a87D7B63E888DE53f03B4191B846a8", // Agent address
    tokens: [
      {
        token: "0xaa7a9ca87d3694b5755f213b5d04094b8d0f0a6f", // TracToken
      },
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
    gateway: string;
    agent: string;
    tokens: { token: string }[];
  };
};

const depositParams: PartialContractEventParams = {
  target: "",
  topic: "Transfer(address,address,uint256)",
  abi: ["event Transfer(address indexed from, address indexed to, uint256 value)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "value",
    from: "from",
    to: "to",
  },
  argGetters: {
    amount: (log: any) => BigNumber.from(log.value),
  },
  fixedEventData: {
    token: "",
  },
  isDeposit: true,
};

const withdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "Transfer(address,address,uint256)",
  abi: ["event Transfer(address indexed from, address indexed to, uint256 value)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "value",
    from: "from",
    to: "to",
  },
  fixedEventData: {
    token: "",
  },
  isDeposit: false,
};

const constructParams = (chain: string) => {
  let eventParams: PartialContractEventParams[] = [];

  const contractAddressesForChain = contractAddresses[chain];
  const gateway = contractAddressesForChain?.gateway;
  const agent = contractAddressesForChain?.agent;
  const tokens = contractAddressesForChain?.tokens || [];

  tokens.map(({ token }) => {
    const tokenDepositParams: PartialContractEventParams = {
      ...depositParams,
      target: token,
      filter: { includeTo: [agent] },
      fixedEventData: { ...depositParams.fixedEventData, token: token },
    };
    const tokenWithdrawalParams: PartialContractEventParams = {
      ...withdrawalParams,
      target: token,
      isDeposit: false,
      filter: { includeFrom: [agent] },
      fixedEventData: { ...withdrawalParams.fixedEventData, token: token },
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
