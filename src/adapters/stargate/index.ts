import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { ethers } from "ethers";

/*
It appears that Stargate: Router does not emit swap events.
Other contracts involved may not help much.
May be easiest to track the transfers to each individual SG token contract,
but need to track events from those contracts as there are also liquidity adding/removal txs.

Factories are here, should update adapter to get erc lists from them:
Ethereum: 0x06D538690AF257Da524f25D0CD52fD85b1c2173E
Polygon: 0x808d7c71ad2ba3FA531b068a2417C63106BC0949
BSC: 0x4a364f8c717cAAD9A442737Eb7b8A55cc6cf18D8
Avax: 0x808d7c71ad2ba3FA531b068a2417C63106BC0949
Fantom: 0x9d1B1669c73b033DFe47ae5a0164Ab96df25B944
Optimism: 0xE3B53AF74a4BF62Ae5511055290838050bf764Df
Metis: 0xAF54BE5B6eEc24d6BFACf1cce4eaF680A8239398

Mappings:
***Polygon***
0x1205f31718499dBf1fCa446663B532Ef87481fe1 to polygon:0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c to polygon:0xc2132D05D31c914a87C6611C10748AEb04B58e8F

***Fantom***
0x12edeA9cd262006cC3C4E77c90d2CD2DD4b1eb97 to fantom:0x04068DA6C83AFCFA0e13ba15A6696662335D5B75

***Avax***
0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c to avax:0xc7198437980c041c805A1EDcbA50c1Ce5db95118
0x1205f31718499dBf1fCa446663B532Ef87481fe1 to avax:0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E

***BSC***
0x98a5737749490856b401DB5Dc27F522fC314A4e1 to bsc:0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56
0x9aA83081AA06AF7208Dcc7A4cB72C94d057D2cda to bsc:0x55d398326f99059fF775485246999027B3197955
0x4e145a589e4c03cBe3d28520e4BF3089834289Df to bsc:0xd17479997F34dd9156Deef8F95A52D81D265be9c

***Arbitrum***
0x892785f33CdeE22A30AEF750F285E18c18040c3e to arbitrum:0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8
0xB6CfcF89a7B22988bfC96632aC2A9D6daB60d641 to arbitrum:0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9

***Optimism***
0xDecC0c09c3B5f6e92EF4184125D5648a66E35298 to optimism:0x7F5c764cBc14f9669B88837ca1490cCa17c31607

***Metis***
0x2b60473a7C41Deb80EDdaafD5560e963440eb632 to metis:0x2b60473a7c41deb80eddaafd5560e963440eb632
*/

const nullAddress = "0x0000000000000000000000000000000000000000";

const contractAddresses = {
  ethereum: {
    stg: "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6",
    ercs: [
      "0x101816545F6bd2b1076434B54383a1E633390A2E", // ETH
      "0xdf0770dF86a8034b3EFEf0A1Bb3c889B8332FF56", // USDC
      "0x38ea452219524bb87e18de1c24d3bb59510bd783", // USDT
      "0x692953e758c3669290cb1677180c64183cEe374e", // USDD
      "0x0Faf1d2d3CED330824de3B8200fc8dc6E397850d", // DAI
      "0xfA0F307783AC21C39E939ACFF795e27b650F6e68", // FRAX
      "0x590d4f8A68583639f215f675F3a259Ed84790580", // sUSD
      "0xE8F55368C82D38bbbbDb5533e7F56AfC2E978CC2", // LUSD
      "0x9cef9a0b1bE0D289ac9f4a98ff317c33EAA84eb8", // MAI
      "0xd8772edBF88bBa2667ed011542343b0eDDaCDa47", // METIS
      "0x430Ebff5E3E80A6C58E7e6ADA1d90F5c28AA116d", // metis.USDT
    ],
    nativeToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    etherVault: "0x72E2F4830b9E45d52F80aC08CB2bEC0FeF72eD9c",
  },
  polygon: {
    stg: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
    ercs: [
      "0x1205f31718499dBf1fCa446663B532Ef87481fe1", // USDC
      "0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c", // USDT
      "0x1c272232Df0bb6225dA87f4dEcD9d37c32f63Eea", // DAI
      "0x8736f92646B2542B3e5F3c63590cA7Fe313e283B", // miMATIC
    ],
  },
  bsc: {
    stg: "0xB0D502E938ed5f4df2E681fE6E419ff29631d62b",
    ercs: [
      "0x98a5737749490856b401DB5Dc27F522fC314A4e1", // BUSD
      "0x9aA83081AA06AF7208Dcc7A4cB72C94d057D2cda", // USDT
      "0x4e145a589e4c03cBe3d28520e4BF3089834289Df", // USDD
      "0x7BfD7f2498C4796f10b6C611D9db393D3052510C", // MAI
      "0xD4CEc732b3B135eC52a3c0bc8Ce4b8cFb9dacE46", // METIS
      "0x68C6c27fB0e02285829e69240BE16f32C5f8bEFe", // metis.USDT
    ],
  },
  avax: {
    stg: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
    ercs: [
      "0x1205f31718499dBf1fCa446663B532Ef87481fe1", // USDC
      "0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c", // USDT
      "0x1c272232Df0bb6225dA87f4dEcD9d37c32f63Eea", // FRAX
      "0x8736f92646B2542B3e5F3c63590cA7Fe313e283B", // MAI
      "0xEAe5c2F6B25933deB62f754f239111413A0A25ef", // metis.USDT
    ],
  },
  fantom: {
    stg: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
    ercs: [
      "0x12edeA9cd262006cC3C4E77c90d2CD2DD4b1eb97", // USDC
    ],
  },
  arbitrum: {
    stg: "0x6694340fc020c5E6B96567843da2df01b2CE1eb6",
    ercs: [
      "0x915A55e36A01285A14f05dE6e81ED9cE89772f8e", // ETH
      "0x892785f33CdeE22A30AEF750F285E18c18040c3e", // USDC
      "0xB6CfcF89a7B22988bfC96632aC2A9D6daB60d641", // USDT
      "0xaa4BF442F024820B2C28Cd0FD72b82c63e66F56C", // FRAX
      "0xF39B7Be294cB36dE8c510e267B82bb588705d977", // MAI
      "0x600E576F9d853c95d58029093A16EE49646F3ca5", // LUSD
    ],
    nativeToken: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    etherVault: "0x82CbeCF39bEe528B5476FE6d1550af59a9dB6Fc0",
  },
  optimism: {
    stg: "0x296F55F8Fb28E498B858d0BcDA06D955B2Cb3f97",
    ercs: [
      "0xd22363e3762cA7339569F3d33EADe20127D5F98C", // ETH
      "0xDecC0c09c3B5f6e92EF4184125D5648a66E35298", // USDC
      "0x165137624F1f692e69659f944BF69DE02874ee27", // DAI
      "0x368605D9C6243A80903b9e326f1Cddde088B8924", // FRAX
      "0x2F8bC9081c7FCFeC25b9f41a50d97EaA592058ae", // sUSD
      "0x3533F5e279bDBf550272a199a223dA798D9eff78", // LUSD
      "0x5421FA1A48f9FF81e4580557E86C7C0D24C18036", // MAI
    ],
    nativeToken: "0x4200000000000000000000000000000000000006",
    etherVault: "0xb69c8CBCD90A39D8D3d3ccf0a3E968511C3856A0",
  },
  metis: {
    ercs: [
      "0xAad094F6A75A14417d39f04E690fC216f080A41a", // METIS
      "0x2b60473a7C41Deb80EDdaafD5560e963440eb632", // m.USDT
    ],
    nativeToken: "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000",
  },
  kava: {
    stg: "0x83c30eb8bc9ad7C56532895840039E62659896ea",
    ercs: [
      "0xAad094F6A75A14417d39f04E690fC216f080A41a", // USDT
    ],
  },

} as {
  [chain: string]: {
    stg?: string;
    ercs: string[];
    nativeToken?: string;
    etherVault?: string;
  };
};

const ethDepositParams: PartialContractEventParams = {
  target: "",
  topic: "Transfer(address,address,uint256)",
  abi: ["event Transfer(address indexed src, address indexed dst, uint256 wad)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "wad",
  },
  txKeys: {
    from: "from",
  },
  functionSignatureFilter: {
    includeSignatures: ["0x1114cd"],
  },
  fixedEventData: {
    token: "",
    to: "",
  },
  isDeposit: true,
};

const ethWithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "TransferNative(address,address,uint256)",
  abi: ["event TransferNative(address indexed src, address indexed dst, uint256 wad)"],
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

const ethStgDepositParams: PartialContractEventParams = {
  target: "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6",
  topic: "SendToChain(uint16,bytes,uint256)",
  abi: ["event SendToChain(uint16 dstChainId, bytes to, uint256 qty)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "qty",
  },
  txKeys: {
    from: "from",
  },
  fixedEventData: {
    token: "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6",
    to: "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6",
  },
  isDeposit: true,
};

const ethStgWithdrawalParams: PartialContractEventParams = {
  target: "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6",
  topic: "ReceiveFromChain(uint16,uint64,uint256)",
  abi: ["event ReceiveFromChain(uint16 srcChainId, uint64 nonce, uint256 qty)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "qty",
  },
  txKeys: {
    to: "to",
  },
  fixedEventData: {
    token: "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6",
    from: "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6",
  },
  isDeposit: false,
};

const stgDepositParams: PartialContractEventParams = {
  target: "",
  topic: "Transfer(address,address,uint256)",
  topics: [ethers.utils.id("Transfer(address,address,uint256)"), null, ethers.utils.hexZeroPad(nullAddress, 32)],
  abi: ["event Transfer(address indexed from, address indexed to, uint256 value)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "from",
    amount: "value",
  },
  fixedEventData: {
    token: "",
  },
  isDeposit: true,
};

const stgWithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "Transfer(address,address,uint256)",
  topics: [ethers.utils.id("Transfer(address,address,uint256)"), ethers.utils.hexZeroPad(nullAddress, 32)],
  abi: ["event Transfer(address indexed from, address indexed to, uint256 value)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    to: "to",
    amount: "value",
  },
  fixedEventData: {
    token: "",
    from: "",
  },
  isDeposit: false,
};

const ercDepositParams: PartialContractEventParams = {
  target: "",
  topic: "Swap(uint16,uint256,address,uint256,uint256,uint256,uint256,uint256)",
  abi: [
    "event Swap(uint16 chainId, uint256 dstPoolId, address from, uint256 amountSD, uint256 eqReward, uint256 eqFee, uint256 protocolFee, uint256 lpFee)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "from",
    amount: "amountSD",
  },
  fixedEventData: {
    token: "",
    to: "",
  },
  isDeposit: true,
};

const ercWithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "SwapRemote(address,uint256,uint256,uint256)",
  abi: ["event SwapRemote(address to, uint256 amountSD, uint256 protocolFee, uint256 dstFee)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
    token: "address",
  },
  argKeys: {
    to: "to",
    amount: "amountSD",
  },
  fixedEventData: {
    token: "",
    from: "",
  },
  isDeposit: false,
};

/*
These are no longer needed.

const stgDepositParams: PartialContractEventParams = {
  target: "",
  topic: "SendToChain(uint16,bytes,uint256)",
  abi: ["event SendToChain(uint16 dstChainId, bytes to, uint256 qty)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "qty",
  },
  txKeys: {
    from: "from",
  },
  fixedEventData: {
    token: "",
    to: "",
  },
  isDeposit: true,
};

const stgWithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "ReceiveFromChain(uint16,uint64,uint256)",
  abi: ["event ReceiveFromChain(uint16 srcChainId, uint64 nonce, uint256 qty)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "qty",
  },
  txKeys: {
    to: "to", // This does not give correct address. Cannot find contract containing fn that is called so I can extract the input data. Example contract interacted with: 0x75dC8e5F50C8221a82CA6aF64aF811caA983B65f (Polygon)
  },
  fixedEventData: {
    token: "",
    from: "",
  },
  isDeposit: false,
};
*/

const constructParams = (chain: string) => {
  let eventParams = [] as any;
  const etherVault = contractAddresses[chain].etherVault;
  const nativeToken = contractAddresses[chain].nativeToken;
  const ercs = contractAddresses[chain].ercs;
  const stg = contractAddresses[chain].stg;
  if (etherVault) {
    const finalEthDepositParams = {
      ...ethDepositParams,
      target: etherVault,
      fixedEventData: {
        token: nativeToken,
        to: etherVault,
      },
    };
    const finalEthWithdrawalParams = {
      ...ethWithdrawalParams,
      target: etherVault,
      fixedEventData: {
        token: nativeToken,
        from: etherVault,
      },
    };
    eventParams.push(finalEthDepositParams, finalEthWithdrawalParams);
  }
  if (chain === "ethereum") {
    eventParams.push(ethStgDepositParams, ethStgWithdrawalParams);
  } else {
    const finalStgDepositParams = {
      ...stgDepositParams,
      target: stg,
      fixedEventData: {
        token: stg,
        to: stg,
      },
    };
    const finalStgWithdrawalParams = {
      ...stgWithdrawalParams,
      target: stg,
      fixedEventData: {
        token: stg,
        from: stg,
      },
    };
    eventParams.push(finalStgDepositParams, finalStgWithdrawalParams);
  }

  for (let address of ercs) {
    const finalErcDepositParams = {
      ...ercDepositParams,
      target: address,
      fixedEventData: {
        token: address,
        to: address,
      },
    };
    const finalErcWithdrawalParams = {
      ...ercWithdrawalParams,
      target: address,
      fixedEventData: {
        token: address,
        from: address,
      },
    };
    eventParams.push(finalErcDepositParams, finalErcWithdrawalParams);
  }
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("stargate", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  fantom: constructParams("fantom"),
  avalanche: constructParams("avax"),
  bsc: constructParams("bsc"),
  arbitrum: constructParams("arbitrum"),
  optimism: constructParams("optimism"),
  kava: constructParams("kava"),
  // metis: constructParams("metis"),
};

export default adapter;
