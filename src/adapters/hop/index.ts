import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, ContractEventParams, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

/*
Contracts: https://github.com/hop-protocol/hop/blob/develop/packages/core/src/addresses/mainnet.ts

***Ethereum***
For all tokens, via 'l1Bridge' contracts:
  -deposits via Send to L2
  -withdrawals via Bond Withdrawal

***Other Chains***
For all tokens, via 'l2Bridge' contracts:
  -deposits via TransferSent
  -withdrawals from l1 via TransferFromL1Completed
  -withdrawals from l2 via WithdrawalBonded
*/

// 'l2Bridge' contracts
const contractAddresses = {
  ethereum: {
    ETH: "0xb8901acB165ed027E32754E0FFe830802919727f",
    DAI: "0x3d4Cc8A61c7528Fd86C55cfe061a78dCBA48EDd1",
    USDC: "0x3666f603Cc164936C1b87e207F36BEBa4AC5f18a",
    USDT: "0x3E4a3a4796d16c0Cd582C382691998f7c06420B6",
    MATIC: "0x22B1Cbb8D98a01a3B71D034BB899775A76Eb1cc2",
    WBTC: "0xb98454270065A31D71Bf635F6F7Ee6A518dFb849",
    HOP: "0x914f986a44AcB623A277d6Bd17368171FCbe4273",
    SNX: "0x893246FACF345c99e4235E5A7bbEE7404c988b96",
    SUSD: "0x36443fC70E073fe9D50425f82a3eE19feF697d62", // seems like it's not used
  },
  polygon: {
    ETH: "0xb98454270065A31D71Bf635F6F7Ee6A518dFb849",
    DAI: "0xEcf268Be00308980B5b3fcd0975D47C4C8e1382a",
    USDC: "0x25D8039bB044dC227f741a9e381CA4cEAE2E6aE8",
    USDT: "0x6c9a1ACF73bd85463A46B0AFc076FBdf602b690B",
    MATIC: "0x553bC791D746767166fA3888432038193cEED5E2",
    WBTC: "0x91Bd9Ccec64fC22475323a0E55d58F7786587905",
    HOP: "0x58c61AeE5eD3D748a1467085ED2650B697A66234",
  },
  arbitrum: {
    ETH: "0x3749C4f034022c39ecafFaBA182555d4508caCCC",
    DAI: "0x7aC115536FE3A185100B2c4DE4cb328bf3A58Ba6",
    USDC: "0x0e0E3d2C5c292161999474247956EF542caBF8dd",
    USDT: "0x72209Fe68386b37A40d6bCA04f78356fd342491f",
    WBTC: "0x3E4a3a4796d16c0Cd582C382691998f7c06420B6",
    HOP: "0x25FB92E505F752F730cAD0Bd4fa17ecE4A384266",
  },
  optimism: {
    ETH: "0x83f6244Bd87662118d96D9a6D44f09dffF14b30E",
    DAI: "0x7191061D5d4C60f598214cC6913502184BAddf18",
    USDC: "0xa81D244A1814468C734E5b4101F7b9c0c577a8fC",
    USDT: "0x46ae9BaB8CEA96610807a275EBD36f8e916b5C61",
    WBTC: "0xB1ea9FeD58a317F81eEEFC18715Dd323FDEf45c4",
    HOP: "0x03D7f750777eC48d39D080b020D83Eb2CB4e3547",
    SNX: "0x16284c7323c35F4960540583998C98B1CfC581a7",
    SUSD: "0x33Fe5bB8DA466dA55a8A32D6ADE2BB104E2C5201", // seems like it's not used
  },
  xdai: {
    ETH: "0xD8926c12C0B2E5Cd40cFdA49eCaFf40252Af491B",
    DAI: "0x0460352b91D7CF42B0E1C1c30f06B602D9ef2238",
    USDC: "0x25D8039bB044dC227f741a9e381CA4cEAE2E6aE8",
    USDT: "0xFD5a186A7e8453Eb867A360526c5d987A00ACaC2",
    MATIC: "0x7ac71c29fEdF94BAc5A5C9aB76E1Dd12Ea885CCC",
    WBTC: "0x07C592684Ee9f71D58853F9387579332d471b6Ca",
    HOP: "0x6F03052743CD99ce1b29265E377e320CD24Eb632",
  },
} as any;

// 'l2CanonicalToken contracts'
const tokenAddresses = {
  ethereum: {
    ETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    MATIC: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
    WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    HOP: "0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC",
    SNX: "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
    SUSD: "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51",
  },
  polygon: {
    ETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    MATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    WBTC: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
    HOP: "0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC",
  },
  arbitrum: {
    ETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    USDC: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    WBTC: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    HOP: "0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC",
  },
  optimism: {
    ETH: "0x4200000000000000000000000000000000000006",
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    USDC: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
    USDT: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    WBTC: "0x68f180fcCe6836688e9084f035309E29Bf0A2095",
    HOP: "0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC",
    SNX: "0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4",
    SUSD: "0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9",
  },
  xdai: {
    ETH: "0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1",
    DAI: "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d",
    USDC: "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83",
    USDT: "0x4ECaBa5870353805a9F068101A40E0f32ed605C6",
    MATIC: "0x7122d7661c4564b7C6Cd4878B06766489a6028A2",
    WBTC: "0x8e5bBbb09Ed1ebdE8674Cda39A0c169401db4252",
    HOP: "0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC",
  },
} as any;

const l1DepositParams: PartialContractEventParams = {
  target: "",
  topic: "TransferSentToL2(uint256,address,uint256,uint256,uint256,address,uint256)",
  abi: [
    "event TransferSentToL2(uint256 indexed chainId, address indexed recipient, uint256 amount, uint256 amountOutMin, uint256 deadline, address indexed relayer, uint256 relayerFee)",
  ],
  argKeys: {
    amount: "amount",
    from: "recipient",
  },
  fixedEventData: {
    token: "",
    to: "",
  },
  isDeposit: true,
};

const l1WithdrawalParams: ContractEventParams = {
  target: "",
  topic: "WithdrawalBonded(bytes32,uint256)",
  abi: ["event WithdrawalBonded(bytes32 indexed transferId, uint256 amount)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
    from: "address",
  },
  inputDataExtraction: {
    inputDataABI: [
      "function bondWithdrawal(address recipient, uint256 amount, bytes32 transferNonce, uint256 bonderFee)",
    ],
    inputDataFnName: "bondWithdrawal",
    inputDataKeys: {
      to: "recipient",
      amount: "amount",
    },
  },
  fixedEventData: {
    token: "",
  },
  isDeposit: false,
};

const l2DepositParams: PartialContractEventParams = {
  target: "",
  topic: "TransferSent(bytes32,uint256,address,uint256,bytes32,uint256,uint256,uint256,uint256)",
  abi: [
    "event TransferSent(bytes32 indexed transferId, uint256 indexed chainId, address indexed recipient, uint256 amount, bytes32 transferNonce, uint256 bonderFee, uint256 index, uint256 amountOutMin, uint256 deadline)",
  ],
  argKeys: {
    amount: "amount",
    from: "recipient",
  },
  fixedEventData: {
    token: "",
    to: "",
  },
  isDeposit: true,
};

const l2FromL1WithdrawalParams: ContractEventParams = {
  target: "",
  topic: "TransferFromL1Completed(address,uint256,uint256,uint256,address,uint256)",
  abi: [
    "event TransferFromL1Completed(address indexed recipient, uint256 amount, uint256 amountOutMin, uint256 deadline, address indexed relayer, uint256 relayerFee)",
  ],
  argKeys: {
    amount: "amount",
    to: "recipient",
  },
  fixedEventData: {
    token: "",
    from: "",
  },
  isDeposit: false,
};

const l2FromL2WithdrawalParams: ContractEventParams = {
  target: "",
  topic: "WithdrawalBonded(bytes32,uint256)",
  abi: ["event WithdrawalBonded(bytes32 indexed transferId, uint256 amount)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
    from: "address",
  },
  inputDataExtraction: {
    inputDataABI: [
      "function bondWithdrawalAndDistribute(address recipient, uint256 amount, bytes32 transferNonce, uint256 bonderFee, uint256 amountOutMin, uint256 deadline)",
    ],
    inputDataFnName: "bondWithdrawalAndDistribute",
    inputDataKeys: {
      to: "recipient",
      amount: "amount",
    },
  },
  fixedEventData: {
    token: "",
  },
  isDeposit: false,
};

const constructParams = (chain: Chain) => {
  let eventParams = [] as any;
  const contracts = contractAddresses[chain];
  const tokens = tokenAddresses[chain];
  if (chain === "ethereum") {
    Object.keys(tokens).map((token: string) => {
      const finalL1DepositParams = {
        ...l1DepositParams,
        target: contracts[token],
        fixedEventData: {
          token: tokens[token],
          to: contracts[token],
        },
      };
      const finalL1WithdrawalParams = {
        ...l1WithdrawalParams,
        target: contracts[token],
        fixedEventData: {
          token: tokens[token],
        },
      };
      eventParams.push(finalL1DepositParams, finalL1WithdrawalParams);
    });
  } else {
    Object.keys(tokens).map((token: string) => {
      const finalL2DepositParams = {
        ...l2DepositParams,
        target: contracts[token],
        fixedEventData: {
          token: tokens[token],
          to: contracts[token],
        },
      };
      const finalL2FromL1WithdrawalParams = {
        ...l2FromL1WithdrawalParams,
        target: contracts[token],
        fixedEventData: {
          token: tokens[token],
          from: contracts[token],
        },
      };
      const finalL2FromL2WithdrawalParams = {
        ...l2FromL2WithdrawalParams,
        target: contracts[token],
        fixedEventData: {
          token: tokens[token],
        },
      };
      eventParams.push(finalL2DepositParams, finalL2FromL1WithdrawalParams, finalL2FromL2WithdrawalParams);
    });
  }
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("hop", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  arbitrum: constructParams("arbitrum"),
  optimism: constructParams("optimism"),
  gnosis: constructParams("xdai")
};

export default adapter;
