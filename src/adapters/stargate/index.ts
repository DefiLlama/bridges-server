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

const v2Addresses: Record<string, { token: string; pool: string }[]> = {
  ethereum: [
    { token: "0x9E32b13ce7f2E80A01932B42553652E053D6ed8e", pool: "0xcDafB1b2dB43f366E48e6F614b8DCCBFeeFEEcD3" }, // metis
    { token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", pool: "0xc026395860Db2d07ee33e05fE50ed7bD583189C7" }, // usdc
    { token: "0xdac17f958d2ee523a2206206994597c13d831ec7", pool: "0x933597a323Eb81cAe705C5bC29985172fd5A3973" }, // usdt
    { token: "0xd5F7838F5C461fefF7FE49ea5ebaF7728bB0ADfa", pool: "0x268Ca24DAefF1FaC2ed883c598200CcbB79E931D" }, // mEth
    { token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", pool: "0x77b2043768d28E9C9aB44E1aBfC95944bcE57931" }, // weth
  ],
  arbitrum: [
    { token: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", pool: "0xcE8CcA271Ebc0533920C83d39F417ED6A0abB7D0" }, // usdt
    { token: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", pool: "0xe8CDF27AcD73a434D661C84887215F7598e7d0d3" }, // usdc
    { token: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", pool: "0xA45B5130f36CDcA45667738e2a258AB09f4A5f7F" }, // weth
  ],
  optimism: [
    { token: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", pool: "0xcE8CcA271Ebc0533920C83d39F417ED6A0abB7D0" }, // usdc
    { token: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58", pool: "0x19cFCE47eD54a88614648DC3f19A5980097007dD" }, // usdt
    { token: "0x4200000000000000000000000000000000000006", pool: "0xe8CDF27AcD73a434D661C84887215F7598e7d0d3" }, // weth
  ],
  polygon: [
    { token: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", pool: "0x9Aa02D4Fae7F58b8E8f34c66E756cC734DAc7fe4" }, // usdc
    { token: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", pool: "0xd47b03ee6d86Cf251ee7860FB2ACf9f91B9fD4d7" }, // usdt
  ],
  scroll: [
    { token: "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4", pool: "0x3Fc69CC4A842838bCDC9499178740226062b14E4" }, // usdc
    { token: "0x5300000000000000000000000000000000000004", pool: "0xC2b638Cb5042c1B3c5d5C969361fB50569840583" }, // weth
  ],
  mantle: [
    { token: "0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111", pool: "0x4c1d3Fc3fC3c177c3b633427c2F769276c547463" }, // weth
    { token: "0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9", pool: "0xAc290Ad4e0c891FDc295ca4F0a6214cf6dC6acDC" }, // usdc
    { token: "0x201eba5cc46d216ce6dc03f6a759e8e766e956ae", pool: "0xB715B85682B731dB9D5063187C450095c91C57FC" }, // usdt
    { token: "0xcDA86A272531e8640cD7F1a92c01839911B90bb0", pool: "0xF7628d84a2BbD9bb9c8E686AC95BB5d55169F3F1" }, // mEth
  ],
  bsc: [{ token: "0x55d398326f99059ff775485246999027b3197955", pool: "0x138EB30f73BC423c6455C53df6D89CB01d9eBc63" }], // usdt
  avax: [
    { token: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", pool: "0x5634c4a5FEd09819E3c46D86A965Dd9447d86e47" }, // usdc
    { token: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", pool: "0x12dC9256Acc9895B076f6638D628382881e62CeE" }, // usdt
  ],
  metis: [
    { token: "0x420000000000000000000000000000000000000A", pool: "0x36ed193dc7160D3858EC250e69D12B03Ca087D08" }, // weth
    { token: "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000", pool: "0xD9050e7043102a0391F81462a3916326F86331F0" }, // metis
    { token: "0xbB06DCA3AE6887fAbF931640f67cab3e3a16F4dC", pool: "0x4dCBFC0249e8d5032F89D6461218a9D2eFff5125" }, // usdt
  ],
  aurora: [
    {
      token: "0x368EBb46ACa6b8D0787C96B2b20bD3CC3F2c45F7",
      pool: "0x81F6138153d473E8c5EcebD3DC8Cd4903506B075",
    },
  ],
  base: [
    {
      token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      pool: "0x27a16dc786820B16E5c9028b75B99F6f604b5d26",
    },
    {
      token: "0x4200000000000000000000000000000000000006",
      pool: "0xdc181Bd607330aeeBEF6ea62e03e5e1Fb4B6F7C7",
    },
  ],
  kava: [
    {
      token: "0x919C1c267BC06a7039e03fcc2eF738525769109c",
      pool: "0x41A5b0470D96656Fb3e8f68A218b39AdBca3420b",
    },
  ],
  klaytn: [
    {
      token: "0xE2053BCf56D2030d2470Fb454574237cF9ee3D4B",
      pool: "0x01A7c805cc47AbDB254CD8AaD29dE5e447F59224",
    },
    {
      token: "0x9025095263d1E548dc890A7589A4C78038aC40ab",
      pool: "0x8619bA1B324e099CB2227060c4BC5bDEe14456c6",
    },
    {
      token: "0x55Acee547DF909CF844e32DD66eE55a6F81dC71b",
      pool: "0xBB4957E44401a31ED81Cab33539d9e8993FA13Ce",
    },
  ],
  linea: [
    {
      token: "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f",
      pool: "0x81F6138153d473E8c5EcebD3DC8Cd4903506B075",
    },
  ],
};

const ercV2DepositParams: PartialContractEventParams = {
  target: "",
  topic: "OFTSent(bytes32,uint32,address,uint256,uint256)",
  abi: [
    "event OFTSent(bytes32 indexed guid, uint32 dstEid, address indexed fromAddress, uint256 amountSentLD, uint256 amountReceivedLD)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "fromAddress",
    amount: "amountSentLD",
  },
  fixedEventData: {
    token: "",
    to: "",
  },
  isDeposit: true,
};

const ercV2WithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "OFTReceived(bytes32,uint32,address,uint256)",
  abi: ["event OFTReceived(bytes32 indexed guid, uint32 srcEid, address indexed toAddress, uint256 amountReceivedLD)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    to: "toAddress",
    amount: "amountReceivedLD",
  },
  fixedEventData: {
    token: "",
    from: "",
  },
  isDeposit: false,
};

interface V2Address {
  token: string;
  pool: string;
}

interface V2Address {
  token: string;
  pool: string;
}

interface ContractAddresses {
  [chain: string]: {
    stg?: string;
    ercs: string[];
    nativeToken?: string;
    etherVault?: string;
  };
}

const constructParams = (chain: string) => {
  let eventParams: PartialContractEventParams[] = [];

  const v2Events: PartialContractEventParams[] = (
    v2Addresses[chain]?.map((address: V2Address) => {
      return [
        {
          ...ercV2DepositParams,
          target: address.pool,
          fixedEventData: {
            token: address.token,
            to: address.pool,
          },
        },
        {
          ...ercV2WithdrawalParams,
          target: address.pool,
          fixedEventData: {
            token: address.token,
            from: address.pool,
          },
        },
      ];
    }) || []
  ).flat();

  eventParams.push(...v2Events);

  const contractAddressesForChain = contractAddresses[chain] as ContractAddresses[string] | undefined;
  const etherVault = contractAddressesForChain?.etherVault;
  const nativeToken = contractAddressesForChain?.nativeToken;
  const ercs = contractAddressesForChain?.ercs || [];
  const stg = contractAddressesForChain?.stg;

  if (etherVault) {
    const finalEthDepositParams: PartialContractEventParams = {
      ...ethDepositParams,
      target: etherVault,
      fixedEventData: {
        token: nativeToken,
        to: etherVault,
      },
    };
    const finalEthWithdrawalParams: PartialContractEventParams = {
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
  } else if (stg) {
    const finalStgDepositParams: PartialContractEventParams = {
      ...stgDepositParams,
      target: stg,
      fixedEventData: {
        token: stg,
        to: stg,
      },
    };
    const finalStgWithdrawalParams: PartialContractEventParams = {
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
    const finalErcDepositParams: PartialContractEventParams = {
      ...ercDepositParams,
      target: address,
      fixedEventData: {
        token: address,
        to: address,
      },
    };
    const finalErcWithdrawalParams: PartialContractEventParams = {
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
  metis: constructParams("metis"),
  klaytn: constructParams("klaytn"),
  linea: constructParams("linea"),
  mantle: constructParams("mantle"),
  base: constructParams("base"),
  aurora: constructParams("aurora"),
};

export default adapter;
