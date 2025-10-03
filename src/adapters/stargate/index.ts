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
      "0xdf0770dF86a8034b3EFEf0A1Bb3c889B8332FF56",
      "0x38EA452219524Bb87e18dE1C24D3bB59510BD783",
      "0x0Faf1d2d3CED330824de3B8200fc8dc6E397850d",
      "0xfA0F307783AC21C39E939ACFF795e27b650F6e68",
      "0x692953e758c3669290cb1677180c64183cEe374e",
      "0x101816545F6bd2b1076434B54383a1E633390A2E",
      "0x590d4f8A68583639f215f675F3a259Ed84790580",
      "0xE8F55368C82D38bbbbDb5533e7F56AfC2E978CC2",
      "0x9cef9a0b1bE0D289ac9f4a98ff317c33EAA84eb8",
      "0xd8772edBF88bBa2667ed011542343b0eDDaCDa47",
      "0x430Ebff5E3E80A6C58E7e6ADA1d90F5c28AA116d",
      "0x1CE66c52C36757Daf6551eDc04800A0Ec9983A09",
      "0xA572d137666DCbAdFA47C3fC41F15e90134C618c",
    ],
    nativeToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    etherVault: "0x72E2F4830b9E45d52F80aC08CB2bEC0FeF72eD9c",
  },
  polygon: {
    stg: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
    ercs: [
      "0x1205f31718499dBf1fCa446663B532Ef87481fe1",
      "0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c",
      "0x1c272232Df0bb6225dA87f4dEcD9d37c32f63Eea",
      "0x8736f92646B2542B3e5F3c63590cA7Fe313e283B",
      "0xEAe5c2F6B25933deB62f754f239111413A0A25ef",
    ],
  },
  bsc: {
    stg: "0xB0D502E938ed5f4df2E681fE6E419ff29631d62b",
    ercs: [
      "0x9aA83081AA06AF7208Dcc7A4cB72C94d057D2cda",
      "0x98a5737749490856b401DB5Dc27F522fC314A4e1",
      "0x4e145a589e4c03cBe3d28520e4BF3089834289Df",
      "0x7BfD7f2498C4796f10b6C611D9db393D3052510C",
      "0xD4CEc732b3B135eC52a3c0bc8Ce4b8cFb9dacE46",
      "0x68C6c27fB0e02285829e69240BE16f32C5f8bEFe",
      "0x5a0F550bfCaDe1D898034D57A6f72E7Aef32CE79",
    ],
  },
  avax: {
    stg: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
    ercs: [
      "0x1205f31718499dBf1fCa446663B532Ef87481fe1",
      "0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c",
      "0x1c272232Df0bb6225dA87f4dEcD9d37c32f63Eea",
      "0x8736f92646B2542B3e5F3c63590cA7Fe313e283B",
      "0xEAe5c2F6B25933deB62f754f239111413A0A25ef",
      "0x45524dc9d05269E1101Ad7Cff1639AE2aA20989d",
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
      "0x892785f33CdeE22A30AEF750F285E18c18040c3e",
      "0xB6CfcF89a7B22988bfC96632aC2A9D6daB60d641",
      "0xaa4BF442F024820B2C28Cd0FD72b82c63e66F56C",
      "0x915A55e36A01285A14f05dE6e81ED9cE89772f8e",
      "0x600E576F9d853c95d58029093A16EE49646F3ca5",
      "0xF39B7Be294cB36dE8c510e267B82bb588705d977",
      "0x1aE7ca4092C0027bBbB1ce99934528aCf6e7074B",
    ],
    nativeToken: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    etherVault: "0x82CbeCF39bEe528B5476FE6d1550af59a9dB6Fc0",
  },
  optimism: {
    stg: "0x296F55F8Fb28E498B858d0BcDA06D955B2Cb3f97",
    ercs: [
      "0xDecC0c09c3B5f6e92EF4184125D5648a66E35298",
      "0x165137624F1f692e69659f944BF69DE02874ee27",
      "0x368605D9C6243A80903b9e326f1Cddde088B8924",
      "0xd22363e3762cA7339569F3d33EADe20127D5F98C",
      "0x2F8bC9081c7FCFeC25b9f41a50d97EaA592058ae",
      "0x3533F5e279bDBf550272a199a223dA798D9eff78",
      "0x5421FA1A48f9FF81e4580557E86C7C0D24C18036",
      "0xB0a7e3b4aedB6F103BC43f2603c6e73151c8886b",
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
  base: {
    stg: "0xE3B53AF74a4BF62Ae5511055290838050bf764Df",
    ercs: ["0x4c80E24119CFB836cdF0a6b53dc23F04F7e652CA"],
    etherVault: "0x28fc411f9e1c480AD312b3d9C60c22b965015c6B",
    nativeToken: "0x4200000000000000000000000000000000000006",
  },
  linea: {
    etherVault: "0xAad094F6A75A14417d39f04E690fC216f080A41a",
    ercs: [],
    nativeToken: "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f",
    stg: "0x808d7c71ad2ba3FA531b068a2417C63106BC0949",
  },
  mantle: {
    stg: "0x8731d54E9D02c286767d56ac03e8037C07e01e98",
    ercs: [
      "0xAad094F6A75A14417d39f04E690fC216f080A41a",
      "0x2b60473a7C41Deb80EDdaafD5560e963440eb632",
      "0xf52b354FFDB323E0667E87a0136040e3e4D9dF33",
    ],
    nativeToken: "0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111",
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
  bsc: [
    { token: "0x55d398326f99059ff775485246999027b3197955", pool: "0x138EB30f73BC423c6455C53df6D89CB01d9eBc63" }, // usdt
    { token: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", pool: "0x962Bd449E630b0d928f308Ce63f1A21F02576057" }, // usdc
  ],
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
    { token: "0x368EBb46ACa6b8D0787C96B2b20bD3CC3F2c45F7", pool: "0x81F6138153d473E8c5EcebD3DC8Cd4903506B075" }, // usdc
  ],
  base: [
    { token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", pool: "0x27a16dc786820B16E5c9028b75B99F6f604b5d26" }, // usdc
    { token: "0x4200000000000000000000000000000000000006", pool: "0xdc181Bd607330aeeBEF6ea62e03e5e1Fb4B6F7C7" }, // weth
  ],
  kava: [
    { token: "0x919C1c267BC06a7039e03fcc2eF738525769109c", pool: "0x41A5b0470D96656Fb3e8f68A218b39AdBca3420b" }, // usdt
  ],
  klaytn: [
    { token: "0xE2053BCf56D2030d2470Fb454574237cF9ee3D4B", pool: "0x01A7c805cc47AbDB254CD8AaD29dE5e447F59224" }, // usdc
    { token: "0x9025095263d1E548dc890A7589A4C78038aC40ab", pool: "0x8619bA1B324e099CB2227060c4BC5bDEe14456c6" }, // usdt
    { token: "0x55Acee547DF909CF844e32DD66eE55a6F81dC71b", pool: "0xBB4957E44401a31ED81Cab33539d9e8993FA13Ce" }, // weth
  ],
  linea: [
    { token: "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f", pool: "0x81F6138153d473E8c5EcebD3DC8Cd4903506B075" }, // usdc
  ],
  lightlink: [
    { token: "0x7EbeF2A4b1B09381Ec5B9dF8C5c6f2dBECA59c73", pool: "0x8731d54E9D02c286767d56ac03e8037C07e01e98" }, // usdc
    { token: "0x808d7c71ad2ba3FA531b068a2417C63106BC0949", pool: "0x06D538690AF257Da524f25D0CD52fD85b1c2173E" }, // usdt
    { token: "0x0000000000000000000000000000000000000000", pool: "0x8731d54E9D02c286767d56ac03e8037C07e01e98" }, // eth
  ],
  abstract: [
    { token: "0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1", pool: "0x91a5Fe991ccB876d22847967CEd24dCd7A426e0E" }, // usdc
    { token: "0x0709F39376dEEe2A2dfC94A58EdEb2Eb9DF012bD", pool: "0x943C484278b8bE05D119DfC73CfAa4c9D8f11A76" }, // usdt
    { token: "0x0000000000000000000000000000000000000000", pool: "0x221F0E1280Ec657503ca55c708105F1e1529527D" }, // eth
  ],
  ape: [
    { token: "0xF1815bd50389c46847f0Bda824eC8da914045D14", pool: "0x2086f755A6d9254045C257ea3d382ef854849B0f" }, // usdc
    { token: "0x674843C06FF83502ddb4D37c2E09C01cdA38cbc8", pool: "0xEb8d955d8Ae221E5b502851ddd78E6C4498dB4f6" }, // usdt
    { token: "0xf4D9235269a96aaDaFc9aDAe454a0618eBE37949", pool: "0x28E0f0eed8d6A6a96033feEe8b2D7F32EB5CCc48" }, // weth
  ],
  bera: [
    { token: "0x549943e04f40284185054145c6E4e9568C1D3241", pool: "0xAF54BE5B6eEc24d6BFACf1cce4eaF680A8239398" }, // usdc
    { token: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590", pool: "0x45f1A95A4D3f3836523F5c83673c797f4d4d263B" }, // weth
  ],
  coredao: [
    { token: "0xa4151B2B3e269645181dCcF2D426cE75fcbDeca9", pool: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590" }, // usdc
    { token: "0x900101d06A7426441Ae63e9AB3B9b0F63Be145F1", pool: "0x45f1A95A4D3f3836523F5c83673c797f4d4d263B" }, // usdt
  ],
  cronosevm: [
    { token: "0xf951eC28187D9E5Ca673Da8FE6757E6f0Be5F77C", pool: "0x57687Bd10D3c2889BB112B36d0AFbfAa0686f7fa" }, // usdc
    { token: "0xf44acfdC916898449E39062934C2b496799B6abe", pool: "0x816f6e3CB269712Eb199f146Db7c3Fb590ae6af2" }, // weth
  ],
  cronoszkevm: [
    { token: "0xaa5b845F8C9c047779bEDf64829601d8B264076c", pool: "0x74491Aa7187c34Fce7D54ff4Fe640b57C9146713" }, // usdc
    { token: "0x898B3560AFFd6D955b1574D87EE09e46669c60eA", pool: "0xA214ce0aC3b4a9225f74bCf9A9AFBA78255942B7" }, // eth
  ],
  degen: [
    { token: "0xF1815bd50389c46847f0Bda824eC8da914045D14", pool: "0xAF54BE5B6eEc24d6BFACf1cce4eaF680A8239398" }, // usdc
    { token: "0x674843C06FF83502ddb4D37c2E09C01cdA38cbc8", pool: "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6" }, // usdt
    { token: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590", pool: "0x45f1A95A4D3f3836523F5c83673c797f4d4d263B" }, // weth
  ],
  flare: [
    { token: "0xFbDa5F676cB37624f28265A144A48B0d6e87d3b6", pool: "0x77C71633C34C3784ede189d74223122422492a0f" }, // usdc
    { token: "0x0B38e83B86d491735fEaa0a791F65c2B99535396", pool: "0x1C10CC06DC6D35970d1D53B2A23c76ef370d4135" }, // usdt
    { token: "0x1502FA4be69d526124D453619276FacCab275d3D", pool: "0x8e8539e4CcD69123c623a106773F2b0cbbc58746" }, // weth
  ],
  flow: [
    { token: "0xF1815bd50389c46847f0Bda824eC8da914045D14", pool: "0xAF54BE5B6eEc24d6BFACf1cce4eaF680A8239398" }, // usdc
    { token: "0x674843C06FF83502ddb4D37c2E09C01cdA38cbc8", pool: "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6" }, // usdt
    { token: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590", pool: "0x45f1A95A4D3f3836523F5c83673c797f4d4d263B" }, // weth
  ],
  fuse: [
    { token: "0xc6Bc407706B7140EE8Eef2f86F9504651b63e7f9", pool: "0xAF54BE5B6eEc24d6BFACf1cce4eaF680A8239398" }, // usdc
    { token: "0x3695Dd1D1D43B794C0B13eb8be8419Eb3ac22bf7", pool: "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6" }, // usdt
    { token: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590", pool: "0x45f1A95A4D3f3836523F5c83673c797f4d4d263B" }, // weth
  ],
  gnosis: [
    { token: "0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0", pool: "0xB1EeAD6959cb5bB9B20417d6689922523B2B86C3" }, // usdc
    { token: "0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1", pool: "0xe9aBA835f813ca05E50A6C0ce65D0D74390F7dE7" }, // weth
  ],
  goat: [
    { token: "0x3a1293Bdb83bBbDd5Ebf4fAc96605aD2021BbC0f", pool: "0x88853D410299BCBfE5fCC9Eef93c03115E908279" }, // weth
    { token: "0x3022b87ac063DE95b1570F46f5e470F8B53112D8", pool: "0xbbA60da06c2c5424f03f7434542280FCAd453d10" }, // usdc
    { token: "0xE1AD845D93853fff44990aE0DcecD8575293681e", pool: "0x549943e04f40284185054145c6E4e9568C1D3241" }, // usdt
  ],
  gravity: [
    { token: "0xFbDa5F676cB37624f28265A144A48B0d6e87d3b6", pool: "0xC1B8045A6ef2934Cf0f78B0dbD489969Fa9Be7E4" }, // usdc
    { token: "0x816E810f9F787d669FB71932DeabF6c83781Cd48", pool: "0x0B38e83B86d491735fEaa0a791F65c2B99535396" }, // usdt
    { token: "0xf6f832466Cd6C21967E0D954109403f36Bc8ceaA", pool: "0x17d65bF79E77B6Ab21d8a0afed3bC8657d8Ee0B2" }, // weth
  ],
  hemi: [
    { token: "0xad11a8BEb98bbf61dbb1aa0F6d6F2ECD87b35afA", pool: "0x45f1A95A4D3f3836523F5c83673c797f4d4d263B" }, // usdc
    { token: "0xbB0D083fb1be0A9f6157ec484b6C79E0A4e31C2e", pool: "0xAF54BE5B6eEc24d6BFACf1cce4eaF680A8239398" }, // usdt
    { token: "0x0000000000000000000000000000000000000000", pool: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590" }, // eth
  ],
  ink: [
    { token: "0xF1815bd50389c46847f0Bda824eC8da914045D14", pool: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590" }, // usdc
  ],
  iota: [
    { token: "0xFbDa5F676cB37624f28265A144A48B0d6e87d3b6", pool: "0x8e8539e4CcD69123c623a106773F2b0cbbc58746" }, // usdc
    { token: "0xC1B8045A6ef2934Cf0f78B0dbD489969Fa9Be7E4", pool: "0x77C71633C34C3784ede189d74223122422492a0f" }, // usdt
    { token: "0x160345fC359604fC6e70E3c5fAcbdE5F7A9342d8", pool: "0x9c2dc7377717603eB92b2655c5f2E7997a4945BD" }, // weth
  ],
  islander: [
    { token: "0xF1815bd50389c46847f0Bda824eC8da914045D14", pool: "0x45A01E4e04F14f7A4a6702c74187c5F6222033cd" }, // usdc
    { token: "0x88853D410299BCBfE5fCC9Eef93c03115E908279", pool: "0xF2c0e57f48276112a596e141817D93bE472Ed6c5" }, // usdt
    { token: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590", pool: "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6" }, // weth
  ],
  manta: [
    { token: "0x0000000000000000000000000000000000000000", pool: "0x9895D81bB462A195b4922ED7De0e3ACD007c32CB" }, // eth
  ],
  nibiru: [
    { token: "0x0829F361A05D993d5CEb035cA6DF3446b060970b", pool: "0x12a272A581feE5577A5dFa371afEB4b2F3a8C2F8" }, // usdc
    { token: "0x43F2376D5D03553aE72F4A8093bbe9de4336EB08", pool: "0xC16977205c53Cd854136031BD2128F75D6ff63C9" }, // usdt
    { token: "0xcdA5b77E2E2268D9E09c874c1b9A4c3F07b37555", pool: "0x108f4c02C9fcDF862e5f5131054c50f13703f916" }, // weth
  ],
  plasma: [
    { token: "0x9895D81bB462A195b4922ED7De0e3ACD007c32CB", pool: "0x0cEb237E109eE22374a567c6b09F373C73FA4cBb" }, // weth
  ],
  peaq: [
    { token: "0xbbA60da06c2c5424f03f7434542280FCAd453d10", pool: "0x5c1a97C144A97E9b370F833a06c70Ca8F2f30DE5" }, // usdc
    { token: "0xf4D9235269a96aaDaFc9aDAe454a0618eBE37949", pool: "0x07cd5A2702394E512aaaE54f7a250ea0576E5E8C" }, // usdt
    { token: "0x6694340fc020c5E6B96567843da2df01b2CE1eb6", pool: "0xe7Ec689f432f29383f217e36e680B5C855051f25" }, // weth
  ],
  plume: [
    { token: "0x3938A812c54304fEffD266C7E2E70B48F9475aD6", pool: "0x8943cb63EEF1B3Dba5F455bFB704477436E31c1A" }, // usdc
    { token: "0xA849026cDA282eeeBC3C39Afcbe87a69424F16B4", pool: "0xE67F75484C69d4A597f6e50eA6F5BB929e3a3d0E" }, // usdt
  ],
  plumephoenix: [
    { token: "0x78adD880A697070c1e765Ac44D65323a0DcCE913", pool: "0x9909fa99b7F7ee7F1c0CBf133f411D43083631E6" }, // usdc
    { token: "0xda6087E69C51E7D31b6DBAD276a3c44703DFdCAd", pool: "0x2D870D17e640eD6c057afBAA0DF56B8DEa5Cf2F6" }, // usdt
    { token: "0xca59cA09E5602fAe8B629DeE83FfA819741f14be", pool: "0x4683CE822272CD66CEa73F5F1f9f5cBcaEF4F066" }, // weth
  ],
  rarible: [
    { token: "0xFbDa5F676cB37624f28265A144A48B0d6e87d3b6", pool: "0x875bee36739e7Ce6b60E056451c556a88c59b086" }, // usdc
    { token: "0x362FAE9A75B27BBc550aAc28a7c1F96C8D483120", pool: "0x17d65bF79E77B6Ab21d8a0afed3bC8657d8Ee0B2" }, // usdt
  ],
  rootstock: [
    { token: "0x74c9f2b00581F1B11AA7ff05aa9F608B7389De67", pool: "0xAF54BE5B6eEc24d6BFACf1cce4eaF680A8239398" }, // usdc
    { token: "0xAf368c91793CB22739386DFCbBb2F1A9e4bCBeBf", pool: "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6" }, // usdt
    { token: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590", pool: "0x45f1A95A4D3f3836523F5c83673c797f4d4d263B" }, // weth
  ],
  sei: [
    { token: "0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1", pool: "0x45d417612e177672958dC0537C45a8f8d754Ac2E" }, // usdc
    { token: "0xB75D0B03c06A926e488e2659DF1A861F860bD3d1", pool: "0x0dB9afb4C33be43a0a0e396Fd1383B4ea97aB10a" }, // usdt
    { token: "0x160345fC359604fC6e70E3c5fAcbdE5F7A9342d8", pool: "0x5c386D85b1B82FD9Db681b9176C8a4248bb6345B" }, // weth
  ],
  soneium: [
    { token: "0xbA9986D2381edf1DA03B0B9c1f8b00dc4AacC369", pool: "0x45f1A95A4D3f3836523F5c83673c797f4d4d263B" }, // usdc
    { token: "0x0000000000000000000000000000000000000000", pool: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590" }, // eth
  ],
  sonic: [
    { token: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894", pool: "0xA272fFe20cFfe769CdFc4b63088DCD2C82a2D8F9" }, // usdc
  ],
  story: [
    { token: "0xF1815bd50389c46847f0Bda824eC8da914045D14", pool: "0x2086f755A6d9254045C257ea3d382ef854849B0f" }, // usdc
    { token: "0x674843C06FF83502ddb4D37c2E09C01cdA38cbc8", pool: "0x3a1293Bdb83bBbDd5Ebf4fAc96605aD2021BbC0f" }, // usdt
    { token: "0xBAb93B7ad7fE8692A878B95a8e689423437cc500", pool: "0xA272fFe20cFfe769CdFc4b63088DCD2C82a2D8F9" }, // weth
  ],
  superposition: [
    { token: "0x6c030c5CC283F791B26816f325b9C632d964F8A1", pool: "0x8EE21165Ecb7562BA716c9549C1dE751282b9B33" }, // usdc
  ],
  taiko: [
    { token: "0x19e26B0638bf63aa9fa4d14c6baF8D52eBE86C5C", pool: "0x77C71633C34C3784ede189d74223122422492a0f" }, // usdc
    { token: "0x9c2dc7377717603eB92b2655c5f2E7997a4945BD", pool: "0x1C10CC06DC6D35970d1D53B2A23c76ef370d4135" }, // usdt
  ],
  telos: [
    { token: "0xF1815bd50389c46847f0Bda824eC8da914045D14", pool: "0x2086f755A6d9254045C257ea3d382ef854849B0f" }, // usdc
    { token: "0x674843C06FF83502ddb4D37c2E09C01cdA38cbc8", pool: "0x3a1293Bdb83bBbDd5Ebf4fAc96605aD2021BbC0f" }, // usdt
    { token: "0xBAb93B7ad7fE8692A878B95a8e689423437cc500", pool: "0xA272fFe20cFfe769CdFc4b63088DCD2C82a2D8F9" }, // weth
  ],
  unichain: [
    { token: "0x0000000000000000000000000000000000000000", pool: "0xe9aBA835f813ca05E50A6C0ce65D0D74390F7dE7" }, // eth
  ],
  xchain: [
    { token: "0xFbDa5F676cB37624f28265A144A48B0d6e87d3b6", pool: "0x17d65bF79E77B6Ab21d8a0afed3bC8657d8Ee0B2" }, // usdc
  ],
  xdc: [
    { token: "0xCc0587aeBDa397146cc828b445dB130a94486e74", pool: "0x8E2E38711080bF8AAb9C74f434d2bae70e67ae44" }, // usdc
    { token: "0xcdA5b77E2E2268D9E09c874c1b9A4c3F07b37555", pool: "0xA4272ad93AC5d2FF048DD6419c88Eb4C1002Ec6b" }, // usdt
    { token: "0xa7348290de5cf01772479c48D50dec791c3fC212", pool: "0xB0d27478A40223e427697Da523c6A3DAF29AaFfB" }, // weth
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
  scroll: constructParams("scroll"),
  lightlink: constructParams("lightlink"),
  // New Stargate chains
  abstract: constructParams("abstract"),
  ape: constructParams("ape"),
  bera: constructParams("bera"),
  coredao: constructParams("core"),
  cronosevm: constructParams("cronos"),
  cronoszkevm: constructParams("cronos_zkevm"),
  degen: constructParams("degen"),
  flare: constructParams("flare"),
  flow: constructParams("flow"),
  fuse: constructParams("fuse"),
  goat: constructParams("goat"),
  gnosis: constructParams("xdai"),
  gravity: constructParams("gravity"),
  hemi: constructParams("hemi"),
  ink: constructParams("ink"),
  iota: constructParams("iotaevm"),
  islander: constructParams("vana"),
  manta: constructParams("manta"),
  nibiru: constructParams("nibiru"),
  plasma: constructParams("plasma"),
  peaq: constructParams("peaq"),
  plume: constructParams("plume"),
  plumephoenix: constructParams("plume_mainnet"),
  rarible: constructParams("rarible"),
  rootstock: constructParams("rsk"),
  sei: constructParams("sei"),
  soneium: constructParams("soneium"),
  sonic: constructParams("sonic"),
  story: constructParams("sty"),
  superposition: constructParams("spn"),
  taiko: constructParams("taiko"),
  telos: constructParams("telos"),
  unichain: constructParams("unichain"),
  xchain: constructParams("idex"),
  xdc: constructParams("xdc"),
};

export default adapter;
