import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

/*
Contracts: https://github.com/across-protocol/contracts-v2/blob/master/deployments/README.md
https://docs.across.to/v/developer-docs/developers/contract-addresses

For all tokens using 'spokepool' contracts:
  -deposits via FundsDeposited event
  -withdrawals via FilledRelay event
*/

const contracts = {
  ethereum: {
    // oldSpokePool: "0x4D9079Bb4165aeb4084c526a32695dCfd2F77381",
    spokePool: "0x5c7BCd6E7De5423a257D81B442095A1a6ced35C5"
  },
  polygon: {
    // oldSpokePool: "0x69B5c72837769eF1e7C164Abc6515DcFf217F920",
    spokePool: "0x9295ee1d8C5b022Be115A2AD3c30C72E34e7F096"
  },
  arbitrum: {
    // oldSpokePool: "0xB88690461dDbaB6f04Dfad7df66B7725942FEb9C",
    spokePool: "0xe35e9842fceaCA96570B734083f4a58e8F7C5f2A"
  },
  optimism: {
    // oldSpokePool: "0xa420b2d1c0841415A695b81E5B867BCD07Dff8C9",
    spokePool: "0x6f26Bf09B1C792e3228e5467807a900A503c0281"
  }
} as any;

const tokenAddresses = {
  ethereum: {
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    UMA: "0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828",
    BAL: "0xba100000625a3754423978a60c9317c58a424e3D",
    ACX: "0x44108f0223a3c3028f5fe7aec7f9bb2e66bef82f",
  },
  polygon: {
    WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    WBTC: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
    UMA: "0x3066818837c5e6eD6601bd5a91B0762877A6B731",
    BAL: "0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3",
    ACX: "0xf328b73b6c685831f238c30a23fc19140cb4d8fc",
  },
  arbitrum: {
    WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    USDC: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    BADGER: "0xbfa641051ba0a0ad1b0acf549a89536a0d76472e",
    WBTC: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    BAL: "0x040d1edc9569d4bab2d15287dc5a4f10f56a56b8",
    UMA: "0xd693Ec944A85eeca4247eC1c3b130DCa9B0C3b22",
    ACX: "0x53691596d1bce8cea565b84d4915e69e03d9c99d",
  },
  optimism: {
    WETH: "0x4200000000000000000000000000000000000006",
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    USDC: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
    WBTC: "0x68f180fcCe6836688e9084f035309E29Bf0A2095",
    UMA: "0xe7798f023fc62146e8aa1b36da45fb70855a77ea",
    BAL: "0xFE8B128bA8C78aabC59d4c64cEE7fF28e9379921",
    ACX: "0xff733b2a3557a7ed6697007ab5d11b79fdd1b76b",
  },
} as any;

const depositParams: PartialContractEventParams = {
  target: "",
  topic: "FundsDeposited(uint256,uint256,uint256,uint64,uint32,uint32,address,address,address,bytes)",
  abi: [
    "event FundsDeposited(uint256 amount, uint256 originChainId, uint256 destinationChainId, uint64 relayerFeePct, uint32 indexed depositId, uint32 quoteTimestamp, address indexed originToken, address recipient, address indexed depositor, bytes message)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "amount",
    to: "recipient",
    from: "depositor",
    token: "originToken",
  },
  isDeposit: true,
};

const relaysParams: PartialContractEventParams = {
  target: "",
  topic:
    "FilledRelay(uint256,uint256,uint256,uint256,uint256,uint256,uint64,uint64,uint32,address,address,address,address,bytes,tuple(address,bytes,int64,bool,int256))",
  abi: [
    "event FilledRelay(uint256 amount, uint256 totalFilledAmount, uint256 fillAmount, uint256 repaymentChainId, uint256 originChainId, uint256 destinationChainId, uint64 relayerFeePct, uint64 realizedLpFeePct, uint32 depositId, address destinationToken,address indexed relayer,address indexed depositor, address recipient, bytes message, tuple(address recipient, bytes message, int64 relayerFeePct, bool isSlowRelay, int256 payoutAdjustmentPct) updatableRelayData)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "fillAmount",
    to: "recipient",
    from: "depositor",
    token: "destinationToken",
  },
  isDeposit: false,
};

const constructParams = (chain: Chain) => {
  let eventParams = [] as any;

  const tokens = tokenAddresses[chain];
  Object.keys(tokens).map((token: string) => {
    const finaldepositParams = {
      ...depositParams,
      target: contracts[token],
    };

    const finalRelaysParams = {
      ...relaysParams,
      target: contracts[token],
    };
    eventParams.push(finaldepositParams, finalRelaysParams);
  });
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("across", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  arbitrum: constructParams("arbitrum"),
  optimism: constructParams("optimism"),
};

export default adapter;
