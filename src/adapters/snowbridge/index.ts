import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
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
      {
        token: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0", // wstETH
      },
      {
        token: "0x45804880De22913dAFE09f4980848ECE6EcbAf78", // PAXG
      },
      {
        token: "0x514910771af9ca656af840dff83e8264ecf986ca", // LINK
      },
      {
        token: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9", // AAVE
      },
      {
        token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
      },
      {
        token: "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497", // SUSDE
      },
      {
        token: "0x5a98fcbea516cf06857215779fd812ca3bef1b32", // LDO
      },
      {
        token: "0x5d3d01fd6d2ad1169b17918eb4f153c6616288eb", // KILT
      },
      {
        token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
      },
      {
        token: "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
      },
      {
        token: "0x56072C95FAA701256059aa122697B133aDEd9279", // SKY
      },
      {
        token: "0x57e114B691Db790C35207b2e685D4A43181e6061", // ENA
      },
      {
        token: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", // WBTC
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
