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
    HOP: "0x914f986a44AcB623A277d6Bd17368171FCbe4273",
    MAGIC: "0xf074540eb83c86211F305E145eB31743E228E57d",
    rETH: "0x87269B23e73305117D0404557bAdc459CEd0dbEc"
  },
  polygon: {
    ETH: "0xb98454270065A31D71Bf635F6F7Ee6A518dFb849",
    DAI: "0xEcf268Be00308980B5b3fcd0975D47C4C8e1382a",
    USDC: "0x25D8039bB044dC227f741a9e381CA4cEAE2E6aE8",
    USDT: "0x6c9a1ACF73bd85463A46B0AFc076FBdf602b690B",
    MATIC: "0x553bC791D746767166fA3888432038193cEED5E2",
    HOP: "0x58c61AeE5eD3D748a1467085ED2650B697A66234",
  },
  arbitrum: {
    ETH: "0x3749C4f034022c39ecafFaBA182555d4508caCCC",
    DAI: "0x7aC115536FE3A185100B2c4DE4cb328bf3A58Ba6",
    USDC: "0x0e0E3d2C5c292161999474247956EF542caBF8dd",
    USDT: "0x72209Fe68386b37A40d6bCA04f78356fd342491f",
    HOP: "0x25FB92E505F752F730cAD0Bd4fa17ecE4A384266",
    MAGIC: "0xEa5abf2C909169823d939de377Ef2Bf897A6CE98",
    rETH: "0xc315239cFb05F1E130E7E28E603CEa4C014c57f0"
  },
  optimism: {
    ETH: "0x83f6244Bd87662118d96D9a6D44f09dffF14b30E",
    DAI: "0x7191061D5d4C60f598214cC6913502184BAddf18",
    USDC: "0xa81D244A1814468C734E5b4101F7b9c0c577a8fC",
    USDT: "0x46ae9BaB8CEA96610807a275EBD36f8e916b5C61",
    HOP: "0x03D7f750777eC48d39D080b020D83Eb2CB4e3547",
    rETH: "0xA0075E8cE43dcB9970cB7709b9526c1232cc39c2"
  },
  xdai: {
    ETH: "0xD8926c12C0B2E5Cd40cFdA49eCaFf40252Af491B",
    DAI: "0x0460352b91D7CF42B0E1C1c30f06B602D9ef2238",
    USDC: "0x25D8039bB044dC227f741a9e381CA4cEAE2E6aE8",
    USDT: "0xFD5a186A7e8453Eb867A360526c5d987A00ACaC2",
    MATIC: "0x7ac71c29fEdF94BAc5A5C9aB76E1Dd12Ea885CCC",
    HOP: "0x6F03052743CD99ce1b29265E377e320CD24Eb632",
  },
  nova: {
    ETH: "0x8796860ca1677Bf5d54cE5A348Fe4b779a8212f3",
    HOP: "0x02D47f76523d2f059b617E4346de67482792eB83",
    MAGIC: "0xE638433e2C1dF5f7a3a21b0a6b5c4b37278e55DC"
  },
  base: {
    ETH: "0x3666f603Cc164936C1b87e207F36BEBa4AC5f18a",
    USDC: "0x46ae9BaB8CEA96610807a275EBD36f8e916b5C61",
    HOP: "0xe22D2beDb3Eca35E6397e0C6D62857094aA26F52",
  },
  linea: {
    ETH: "0xCbb852A6274e03fA00fb4895dE0463f66dF27a11",
    HOP: "0x0a6b1904369fE59E002ad0713ae89d4E3dF5A7Cf",
  },
  polygonZkevm: {
    ETH: "0x0ce6c85cF43553DE10FC56cecA0aef6Ff0DD444d",
    HOP: "0x9ec9551d4A1a1593b0ee8124D98590CC71b3B09D",
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
    HOP: "0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC",
    MAGIC: "0xB0c7a3Ba49C7a6EaBa6cD4a96C55a1391070Ac9A",
    rETH: "0xae78736Cd615f374D3085123A210448E74Fc6393"
  },
  polygon: {
    ETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    MATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    HOP: "0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC",
  },
  arbitrum: {
    ETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    USDC: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    HOP: "0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC",
    MAGIC: "0x539bdE0d7Dbd336b79148AA742883198BBF60342",
    rETH: "0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8"
  },
  optimism: {
    ETH: "0x4200000000000000000000000000000000000006",
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    USDC: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
    USDT: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    HOP: "0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC",
    rETH: "0x9Bcef72be871e61ED4fBbc7630889beE758eb81D"
  },
  xdai: {
    ETH: "0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1",
    DAI: "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d",
    USDC: "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83",
    USDT: "0x4ECaBa5870353805a9F068101A40E0f32ed605C6",
    MATIC: "0x7122d7661c4564b7C6Cd4878B06766489a6028A2",
    HOP: "0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC",
  },
  nova: {
    ETH: "0x722E8BdD2ce80A4422E880164f2079488e115365",
    HOP: "0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC",
    MAGIC: "0xe8936ac97A85d708d5312D52C30c18d4533b8A9c"
  },
  base: {
    ETH: "0x4200000000000000000000000000000000000006",
    USDC: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
    HOP: "0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC",
  },
  linea: {
    ETH: "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f",
    HOP: "0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC",
  },
  polygonZkevm: {
    ETH: "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9",
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
  gnosis: constructParams("xdai"),
  nova: constructParams("nova"),
  base: constructParams("base"),
  linea: constructParams("linea"),
  polygonZkevm: constructParams("polygonZkevm")
};

export default adapter;
