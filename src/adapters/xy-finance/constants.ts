export enum Chain {
  Ethereum = 'ethereum',
  Scroll = 'scroll',
  Mantle = 'mantle',
  Linea = 'linea',
  Base = 'base',
  Arbitrum = 'arbitrum',
  ZkSync = 'era',
  Bsc = 'bsc',
  Polygon = 'polygon',
  Klaytn = 'klaytn',
  PolygonZkevm = 'polygon_zkevm',
  Avalanche = 'avax',
  Optimism = 'optimism',
  Cronos = 'cronos',
  Fantom = 'fantom',
  Astar = 'astar',
  Kcc = 'kcc',
  Moonriver = 'moonriver',
  ThunderCore = 'thundercore',
  Numbers = 'numbers',
  Wemix = 'wemix',
  Blast = 'blast',
  XLayer = 'xlayer'
}

export enum VAULTS_TOKEN {
  USDT,
  USDC,
  ETH
}

type ContractAddress = string
type YBridgeVaultsTokenAddress = Record<VAULTS_TOKEN, {
  contractAddress: ContractAddress
  tokenAddress: ContractAddress
}>
export const YBridgeVaultsTokenContractAddress: Record<Exclude<Chain, Chain.Numbers>, YBridgeVaultsTokenAddress> = {
  [Chain.Ethereum]: {
    [VAULTS_TOKEN.USDT]: {
      contractAddress: '0x8e921191a9dc6832C1c360C7c7B019eFB7c29B2d',
      tokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    },
    [VAULTS_TOKEN.USDC]: {
      contractAddress: '0xdD8B0995Cc92c7377c7bce2A097EC70f45A192D5',
      tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    },
    [VAULTS_TOKEN.ETH]: {
      contractAddress: '0x57eA46759fed1B47C200a9859e576239A941df76',
      tokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    },
  },
  [Chain.Scroll]: {
    [VAULTS_TOKEN.USDT]: {
      contractAddress: '',
      tokenAddress: ''
    },
    [VAULTS_TOKEN.USDC]: {
      contractAddress: '0xF526EFc174b512e66243Cb52524C1BE720144e8d',
      tokenAddress: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4'
    },
    [VAULTS_TOKEN.ETH]: {
      contractAddress: '0x0241fb446d6793866245b936F2C3418F818bDcD3',
      tokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    },
  },
  [Chain.Mantle]: {
    [VAULTS_TOKEN.USDT]: {
      contractAddress: '0x0241fb446d6793866245b936F2C3418F818bDcD3',
      tokenAddress: '0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE'
    },
    [VAULTS_TOKEN.USDC]: {
      contractAddress: '0xA5Cb30E5d30A9843B6481fFd8D8D35DDED3a3251',
      tokenAddress: '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9'
    },
    [VAULTS_TOKEN.ETH]: {
      contractAddress: '0xdD8B0995Cc92c7377c7bce2A097EC70f45A192D5',
      tokenAddress: '0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111'
    },
  },
  [Chain.Linea]: {
    [VAULTS_TOKEN.USDT]: {
      contractAddress: '',
      tokenAddress: ''
    },
    [VAULTS_TOKEN.USDC]: {
      contractAddress: '0x9d90CFa17f3AFceE2505B3e9D75113e6f5c9E843',
      tokenAddress: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff'
    },
    [VAULTS_TOKEN.ETH]: {
      contractAddress: '0xA5Cb30E5d30A9843B6481fFd8D8D35DDED3a3251',
      tokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    },
  },
  [Chain.Base]: {
    [VAULTS_TOKEN.USDT]: {
      contractAddress: '',
      tokenAddress: ''
    },
    [VAULTS_TOKEN.USDC]: {
      contractAddress: '0xA5Cb30E5d30A9843B6481fFd8D8D35DDED3a3251',
      tokenAddress: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA'
    },
    [VAULTS_TOKEN.ETH]: {
      contractAddress: '0xD195070107d853e55Dad9A2e6e7E970c400E67b8',
      tokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    },
  },
  [Chain.Arbitrum]: {
    [VAULTS_TOKEN.USDT]: {
      contractAddress: '0x7a483730AD5a845ED2962c49DE38Be1661D47341',
      tokenAddress: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'
    },
    [VAULTS_TOKEN.USDC]: {
      contractAddress: '0x680ab543ACd0e52035E9d409014dd57861FA1eDf',
      tokenAddress: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'
    },
    [VAULTS_TOKEN.ETH]: {
      contractAddress: '0xd1ae4594E47C153ae98F09E0C9267FB74447FEa3',
      tokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    },
  },
  [Chain.ZkSync]: {
    [VAULTS_TOKEN.USDT]: {
      contractAddress: '',
      tokenAddress: ''
    },
    [VAULTS_TOKEN.USDC]: {
      contractAddress: '0x75167284361c8D61Be7E4402f4953e2b112233cb',
      tokenAddress: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4'
    },
    [VAULTS_TOKEN.ETH]: {
      contractAddress: '0x935283A00FBF8E40fd2f8C432A488F6ADDC8dB67',
      tokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    },
  },
  [Chain.Bsc]: {
    [VAULTS_TOKEN.USDT]: {
      contractAddress: '0xD195070107d853e55Dad9A2e6e7E970c400E67b8',
      tokenAddress: '0x55d398326f99059fF775485246999027B3197955'
    },
    [VAULTS_TOKEN.USDC]: {
      contractAddress: '0x27C12BCb4538b12fdf29AcB968B71dF7867b3F64',
      tokenAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
    },
    [VAULTS_TOKEN.ETH]: {
      contractAddress: '0xa0ffc7eDB9DAa9C0831Cdf35b658e767ace33939',
      tokenAddress: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8'
    },
  },
  [Chain.Polygon]: {
    [VAULTS_TOKEN.USDT]: {
      contractAddress: '0x3243278E0F93cD6F88FC918E0714baF7169AFaB8',
      tokenAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
    },
    [VAULTS_TOKEN.USDC]: {
      contractAddress: '0xf4137e5D07b476e5A30f907C3e31F9FAAB00716b',
      tokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
    },
    [VAULTS_TOKEN.ETH]: {
      contractAddress: '0x29d91854B1eE21604119ddc02e4e3690b9100017',
      tokenAddress: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'
    },
  },
  [Chain.Klaytn]: {
    [VAULTS_TOKEN.USDT]: {
      contractAddress: '0xF526EFc174b512e66243Cb52524C1BE720144e8d',
      tokenAddress: '0xceE8FAF64bB97a73bb51E115Aa89C17FfA8dD167'
    },
    [VAULTS_TOKEN.USDC]: {
      contractAddress: '0xB238d4339a44f93aBCF4071A9bB0f55D2403Fd84',
      tokenAddress: '0x754288077D0fF82AF7a5317C7CB8c444D421d103'
    },
    [VAULTS_TOKEN.ETH]: {
      contractAddress: '',
      tokenAddress: ''
    },
  },
  [Chain.PolygonZkevm]: {
    [VAULTS_TOKEN.USDT]: {
      contractAddress: '',
      tokenAddress: ''
    },
    [VAULTS_TOKEN.USDC]: {
      contractAddress: '0x1acCfC3a45313f8F862BE7fbe9aB25f20A93d598',
      tokenAddress: '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035'
    },
    [VAULTS_TOKEN.ETH]: {
      contractAddress: '0x9fE77412aA5c6Ba67fF3095bBc534884F9a61a38',
      tokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    },
  },
  [Chain.Avalanche]: {
    [VAULTS_TOKEN.USDT]: {
      contractAddress: '0x3D2d1ce29B8bC997733D318170B68E63150C6586',
      tokenAddress: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7'
    },
    [VAULTS_TOKEN.USDC]: {
      contractAddress: '0x21ae3E63E06D80c69b09d967d88eD9a98c07b4e4',
      tokenAddress: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E'
    },
    [VAULTS_TOKEN.ETH]: {
      contractAddress: '0xEFaaf68a9a8b7D93bb15D29c8B77FCe87Fcc91b8',
      tokenAddress: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB'
    },
  },
  [Chain.Optimism]: {
    [VAULTS_TOKEN.USDT]: {
      contractAddress: '0xF526EFc174b512e66243Cb52524C1BE720144e8d',
      tokenAddress: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58'
    },
    [VAULTS_TOKEN.USDC]: {
      contractAddress: '0x1e4992E1Be86c9d8ed7dcBFcF3665FE568dE98Ab',
      tokenAddress: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607'
    },
    [VAULTS_TOKEN.ETH]: {
      contractAddress: '0x91474Fe836BBBe63EF72De2846244928860Bce1B',
      tokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    },
  },
  [Chain.Cronos]: {
    [VAULTS_TOKEN.USDT]: {
      contractAddress: '0x74A0EEA77e342323aA463098e959612d3Fe6E686',
      tokenAddress: '0x66e428c3f67a68878562e79A0234c1F83c208770'
    },
    [VAULTS_TOKEN.USDC]: {
      contractAddress: '0x44a54941E572C526a599B0ebe27A14A5BF159333',
      tokenAddress: '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59'
    },
    [VAULTS_TOKEN.ETH]: {
      contractAddress: '0x8266B0c8eF1d70cC4b04F8E8F7508256c0E1200f',
      tokenAddress: '0xe44Fd7fCb2b1581822D0c862B68222998a0c299a'
    },
  },
  [Chain.Fantom]: {
    [VAULTS_TOKEN.USDT]: {
      contractAddress: '0xC255563d3Bc3Ed7dBbb8EaE076690497bfBf7Ef8',
      tokenAddress: '0x049d68029688eAbF473097a2fC38ef61633A3C7A'
    },
    [VAULTS_TOKEN.USDC]: {
      contractAddress: '0x3A459695D49cD6B9637bC85B7ebbb04c5c3038c0',
      tokenAddress: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75'
    },
    [VAULTS_TOKEN.ETH]: {
      contractAddress: '0x5146ba1f786D41ba1E876b5Fd3aA56bD516Ed273',
      tokenAddress: '0x74b23882a30290451A17c44f4F05243b6b58C76d'
    },
  },
  [Chain.Astar]: {
    [VAULTS_TOKEN.USDT]: {
      contractAddress: '0xF526EFc174b512e66243Cb52524C1BE720144e8d',
      tokenAddress: '0x3795C36e7D12A8c252A20C5a7B455f7c57b60283'
    },
    [VAULTS_TOKEN.USDC]: {
      contractAddress: '0xD236639F5B00BC6711aC799bac5AceaF788b2Aa3',
      tokenAddress: '0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98'
    },
    [VAULTS_TOKEN.ETH]: {
      contractAddress: '',
      tokenAddress: ''
    },
  },
  [Chain.Kcc]: {
    [VAULTS_TOKEN.USDT]: {
      contractAddress: '0xF526EFc174b512e66243Cb52524C1BE720144e8d',
      tokenAddress: '0x0039f574eE5cC39bdD162E9A88e3EB1f111bAF48'
    },
    [VAULTS_TOKEN.USDC]: {
      contractAddress: '0xa274931559Fb054bF60e0C44355D3558bB8bC2E6',
      tokenAddress: '0x980a5AfEf3D17aD98635F6C5aebCBAedEd3c3430'
    },
    [VAULTS_TOKEN.ETH]: {
      contractAddress: '',
      tokenAddress: ''
    },
  },
  [Chain.Moonriver]: {
    [VAULTS_TOKEN.USDT]: {
      contractAddress: '0xF526EFc174b512e66243Cb52524C1BE720144e8d',
      tokenAddress: '0xB44a9B6905aF7c801311e8F4E76932ee959c663C'
    },
    [VAULTS_TOKEN.USDC]: {
      contractAddress: '0x680ab543ACd0e52035E9d409014dd57861FA1eDf',
      tokenAddress: '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D'
    },
    [VAULTS_TOKEN.ETH]: {
      contractAddress: '',
      tokenAddress: ''
    },
  },
  [Chain.ThunderCore]: {
    [VAULTS_TOKEN.USDT]: {
      contractAddress: '0x74A0EEA77e342323aA463098e959612d3Fe6E686',
      tokenAddress: '0x4f3C8E20942461e2c3Bdd8311AC57B0c222f2b82'
    },
    [VAULTS_TOKEN.USDC]: {
      contractAddress: '0x2641911948e0780e615A9465188D975Fa4A72f2c',
      tokenAddress: '0x22e89898A04eaf43379BeB70bf4E38b1faf8A31e'
    },
    [VAULTS_TOKEN.ETH]: {
      contractAddress: '',
      tokenAddress: ''
    },
  },
  [Chain.Wemix]: {
    [VAULTS_TOKEN.USDT]: {
      contractAddress: '0xA5Cb30E5d30A9843B6481fFd8D8D35DDED3a3251',
      tokenAddress: '0xA649325Aa7C5093d12D6F98EB4378deAe68CE23F'
    },
    [VAULTS_TOKEN.USDC]: {
      contractAddress: '0x3243278E0F93cD6F88FC918E0714baF7169AFaB8',
      tokenAddress: '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D'
    },
    [VAULTS_TOKEN.ETH]: {
      contractAddress: '',
      tokenAddress: ''
    },
  },
  [Chain.Blast]: {
    [VAULTS_TOKEN.USDT]: {
      contractAddress: '',
      tokenAddress: ''
    },
    [VAULTS_TOKEN.USDC]: {
      contractAddress: '',
      tokenAddress: ''
    },
    [VAULTS_TOKEN.ETH]: {
      contractAddress: '0xFa77c2DecCB21ACb9Bf196408Bf6aD5973D07762',
      tokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    },
  },
  [Chain.XLayer]: {
    [VAULTS_TOKEN.USDT]: {
      contractAddress: '0x1e4992E1Be86c9d8ed7dcBFcF3665FE568dE98Ab',
      tokenAddress: '0x1E4a5963aBFD975d8c9021ce480b42188849D41d'
    },
    [VAULTS_TOKEN.USDC]: {
      contractAddress: '',
      tokenAddress: ''
    },
    [VAULTS_TOKEN.ETH]: {
      contractAddress: '0xFa77c2DecCB21ACb9Bf196408Bf6aD5973D07762',
      tokenAddress: '0x5A77f1443D16ee5761d310e38b62f77f726bC71c'
    },
  }
}

export const YBridgeContractAddress: Record<Exclude<Chain, Chain.Numbers>, ContractAddress> = {
  [Chain.Ethereum]: '0x4315f344a905dC21a08189A117eFd6E1fcA37D57',
  [Chain.Scroll]: "0x778C974568e376146dbC64fF12aD55B2d1c4133f",
  [Chain.Mantle]: "0x73Ce60416035B8D7019f6399778c14ccf5C9c7A1",
  [Chain.Linea]: "0x73Ce60416035B8D7019f6399778c14ccf5C9c7A1",
  [Chain.Base]: "0x73Ce60416035B8D7019f6399778c14ccf5C9c7A1",
  [Chain.Arbitrum]: "0x33383265290421C704c6b09F4BF27ce574DC4203",
  [Chain.ZkSync]: "0xe4e156167cc9C7AC4AbD8d39d203a5495F775547",
  [Chain.Bsc]: "0x7D26F09d4e2d032Efa0729fC31a4c2Db8a2394b1",
  [Chain.Polygon]: "0x0c988b66EdEf267D04f100A879db86cdb7B9A34F",
  [Chain.Klaytn]: "0x52075Fd1fF67f03beABCb5AcdA9679b02d98cA37",
  [Chain.PolygonZkevm]: "0x3689D3B912d4D73FfcAad3a80861e7caF2d4F049",
  [Chain.Avalanche]: "0x2C86f0FF75673D489b7D72D9986929a2b0Ed596C",
  [Chain.Optimism]: "0x7a6e01880693093abACcF442fcbED9E0435f1030",
  [Chain.Cronos]: "0xF103b5B479d2A629F422C42bb35E7eEceE1ad55E",
  [Chain.Fantom]: "0xDa241399697fa3F6cD496EdAFab6191498Ec37F5",
  [Chain.Astar]: "0x5C6C12Fd8b1f7E60E5B60512712cFbE0192E795E",
  [Chain.Kcc]: "0x7e803b54295Cd113Bf48E7f069f0531575DA1139",
  [Chain.Moonriver]: "0xc67Dd7054915a2B0aA3e48f35DA714Ff861e71BD",
  [Chain.ThunderCore]: "0xF103b5B479d2A629F422C42bb35E7eEceE1ad55E",
  [Chain.Wemix]: "0x73Ce60416035B8D7019f6399778c14ccf5C9c7A1",
  [Chain.Blast]: "0x73Ce60416035B8D7019f6399778c14ccf5C9c7A1",
  [Chain.XLayer]: "0x73Ce60416035B8D7019f6399778c14ccf5C9c7A1"
}

export const XYRouterContractAddress: Record<Chain, ContractAddress> = {
  [Chain.Ethereum]: "0xFfB9faf89165585Ad4b25F81332Ead96986a2681",
  [Chain.Scroll]: "0x22bf2A9fcAab9dc96526097318f459eF74277042",
  [Chain.Mantle]: "0x52075Fd1fF67f03beABCb5AcdA9679b02d98cA37",
  [Chain.Linea]: "0xc693C8AAD9745588e95995fef4570d6DcEF98000",
  [Chain.Base]: "0x6aCd0Ec9405CcB701c57A88849C4F1CD85a3f3ab",
  [Chain.Arbitrum]: "0x062b1Db694F6A437e3c028FC60dd6feA7444308c",
  [Chain.ZkSync]: "0x30E63157bD0bA74C814B786F6eA2ed9549507b46",
  [Chain.Bsc]: "0xDF921bc47aa6eCdB278f8C259D6a7Fef5702f1A9",
  [Chain.Polygon]: "0xa1fB1F1E5382844Ee2D1BD69Ef07D5A6Abcbd388",
  [Chain.Klaytn]: "0x252eA5AebEB648e7e871DAD7E0aB6cb49096BdD5",
  [Chain.PolygonZkevm]: "0x218Ef86b88765df568E9D7d7Fd34B5Dc88098080",
  [Chain.Avalanche]: "0xa0c0F962DECD78D7CDE5707895603CBA74C02989",
  [Chain.Optimism]: "0xF8d342db903F266de73B10a1e46601Bb08a3c195",
  [Chain.Cronos]: "0x5d6e7E537cb4a8858C8B733A2A307B4aAFDc42ca",
  [Chain.Fantom]: "0x1E1a70eDb9cd26ccc05F01C66B882cef0E4f7d2D",
  [Chain.Astar]: "0x9c83E6F9E8DA12af8a0Cb8E276b722EB3D7668aF",
  [Chain.Kcc]: "0x562afa22b2Fc339fd7Fa03E734E7008C3EccF8CF",
  [Chain.Moonriver]: "0x64d17beaE666cC435B9d40a21f058b379b2a0194",
  [Chain.ThunderCore]: "0xbF26ca7cf925e9EA0765c737B066253CF80e0E09",
  [Chain.Numbers]: "0x1acCfC3a45313f8F862BE7fbe9aB25f20A93d598",
  [Chain.Wemix]: "0x6471fAd467ac2854b403e7FE3e95FBbB3287a7ee",
  [Chain.Blast]: "0x43A86823EBBe2ECF9A384aDfD989E26A30626458",
  [Chain.XLayer]: "0x6A816cEE105a9409D8df0A83d8eeaeD9EB4309fE"
}