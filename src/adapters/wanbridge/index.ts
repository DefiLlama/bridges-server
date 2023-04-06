import {
  BridgeAdapter,
  PartialContractEventParams,
} from "../../helpers/bridgeAdapter.type";
import {getTxDataFromEVMEventLogs} from "../../helpers/processTransactions";
import {constructTransferParams} from "../../helpers/eventParams";

const contracts = {
  arbitrum: {
    pools: [
      '0xf7ba155556e2cd4dfe3fe26e506a14d2f4b97613'
    ]
  },
  astar: {
    pools: [
      '0x592de30bebff484b5a43a6e8e3ec1a814902e0b6'
    ]
  },
  avax: {
    pools: [
      '0x74e121a34a66d54c33f3291f2cdf26b1cd037c3a'
    ]
  },
  bsc: {
    pools: [
      '0xc3711bdbe7e3063bf6c22e7fed42f782ac82baee'
    ]
  },
  clv: {
    pools: [
      '0xf7ba155556e2cd4dfe3fe26e506a14d2f4b97613'
    ]
  },
  ethereum: {
    pools: [
      '0xfceaaaeb8d564a9d0e71ef36f027b9d162bc334e'
    ]
  },
  fantom: {
    pools: [
      '0xccffe9d337f3c1b16bd271d109e691246fd69ee3'
    ]
  },
  moonbeam: {
    pools: [
      '0x6372aec6263aa93eacedc994d38aa9117b6b95b5'
    ]
  },
  moonriver: {
    pools: [
      '0xde1ae3c465354f01189150f3836c7c15a1d6671d'
    ]
  },
  okexchain: {
    pools: [
      '0xf7ba155556e2cd4dfe3fe26e506a14d2f4b97613'
    ]
  },
  optimism: {
    pools: [
      '0xc6ae1db6c66d909f7bfeeeb24f9adb8620bf9dbf' 
    ]
  },
  polygon: {
    pools: [
      '0x2216072a246a84f7b9ce0f1415dd239c9bf201ab' 
    ]
  },
  telos: {
    pools: [
      '0x201e5de97dfc46aace142b2009332c524c9d8d82'
    ]
  },
  wan: {
    pools: [
      '0xe85b0d89cbc670733d6a40a9450d8788be13da47' 
    ]
  },
  xdc: {
    pools: [
      '0xf7ba155556e2cd4dfe3fe26e506a14d2f4b97613' 
    ]
  }
};

const constructParams = (chain: keyof typeof contracts) => {
  const eventParams: PartialContractEventParams[] = [];

  for (const poolAddress of contracts[chain].pools) {
    eventParams.push(constructTransferParams(
      poolAddress,
      true
    ),constructTransferParams(
      poolAddress,
      false
    ));

  }

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("allbridge", chain, fromBlock, toBlock, eventParams);

}
const adapter: BridgeAdapter = {
  arbitrum: constructParams('arbitrum'),
  astar: constructParams('astar'),
  avax: constructParams('avax'),
  bsc: constructParams('bsc'),
  clv: constructParams('clv'),
  ethereum: constructParams('ethereum'),
  fantom: constructParams('fantom'),
  moonbeam: constructParams('moonbeam'),
  moonriver: constructParams('moonriver'),
  okexchain: constructParams('okexchain'),
  optimism: constructParams('optimism'),
  polygon: constructParams('polygon'),
  telos: constructParams('telos'),
  wan: constructParams('wan'),
  xdc: constructParams('xdc'),
};

export default adapter;
