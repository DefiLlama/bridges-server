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
}

export enum VAULTS_TOKEN {
  USDT,
  USDC,
  ETH
}

export const YBridgeVaultsTokenContractAddress = {
  [VAULTS_TOKEN.USDT]: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  [VAULTS_TOKEN.USDC]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  [VAULTS_TOKEN.ETH]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
}

export const YBridgeContractAddress: Record<Exclude<Chain, Chain.Numbers>, string> = {
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
}

export const XYRouterCOntractAddress: Record<Chain, string> = {
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
  [Chain.Wemix]: "0x6471fAd467ac2854b403e7FE3e95FBbB3287a7ee"
}