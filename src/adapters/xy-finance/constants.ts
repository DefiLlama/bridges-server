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
  // Numbers = 'numbers',
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

export const YBridgeContractAddress: Record<Chain, string> = {
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
  // [Chain.Numbers]: ""
}