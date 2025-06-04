import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const contractAddresses = {
  ethereum: {
    WBTC: "0x795dcb58d1cd4789169d5f938ea05e17eceb68ca",
    USDC: "0xd8a6e3fca403d79b6ad6216b60527f51cc967d39",
    cbBTC: "0xeae7721d779276eb0f5837e2fe260118724a2ba4",
    iBTC: "0xDC74a45e86DEdf1fF7c6dac77e0c2F082f9E4F72",
  },
  arbitrum: {
    WBTC: "0x6b6303fab8ec7232b4f2a7b9fa58e5216f608fcb",
    USDC: "0xeae7721d779276eb0f5837e2fe260118724a2ba4",
    iBTC: "0xdc74a45e86dedf1ff7c6dac77e0c2f082f9e4f72",
  },
  base: {
    cbBTC: "0xeae7721d779276eb0f5837e2fe260118724a2ba4",
    USDC: "0xd8a6e3fca403d79b6ad6216b60527f51cc967d39",
  },
  unichain: {
    WBTC: "0xD8a6E3FCA403d79b6AD6216b60527F51cc967D39",
    USDC: "0x795Dcb58d1cd4789169D5F938Ea05E17ecEB68cA",
  },
  berachain: {
    LBTC: "0x39f3294352208905fc6ebf033954E6c6455CdB4C",
  },
  hyperliquid: {
    uBTC: "0x39f3294352208905fc6ebf033954E6c6455CdB4C",
  },
  
} as any;
const tokenAddresses = {
  ethereum: {
    WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    cbBTC: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
    iBTC: "0x20157DBAbb84e3BBFE68C349d0d44E48AE7B5AD2",
  },
  arbitrum: {
    WBTC: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    iBTC: "0x050C24dBf1eEc17babE5fc585F06116A259CC77A",
  },
  base: {
    cbBTC: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  },
  unichain: {
    WBTC: "0x927B51f251480a681271180DA4de28D44EC4AfB8",
    USDC: "0x078D782b760474a361dDA0AF3839290b0EF57AD6",
  },
  berachain: {
    LBTC: "0xecAc9C5F704e954931349Da37F60E39f515c11c1",
  },
  hyperliquid: {
    uBTC: "0x9FDBdA0A5e284c32744D2f17Ee5c74B284993463",
  },
  
} as any;


const constructParams = (chain: Chain) => {
  let eventParams = [] as PartialContractEventParams[];
  const contracts = contractAddresses[chain];
  const tokens = tokenAddresses[chain];

  Object.keys(contracts).forEach((token: string) => {
    const depositParams = constructTransferParams(contracts[token], true, {}, {}, chain);
    const withdrawParams = constructTransferParams(contracts[token], false, {}, {}, chain);
    eventParams.push(depositParams, withdrawParams);
  });

  return async (fromBlock: number, toBlock: number) => {
    return getTxDataFromEVMEventLogs("garden", chain, fromBlock, toBlock, eventParams);
  };
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  arbitrum: constructParams("arbitrum"),
  base: constructParams("base"),
  unichain: constructParams("unichain"),
  berachain: constructParams("berachain"),
  hyperliquid: constructParams("hyperliquid"),
};

export default adapter;