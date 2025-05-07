import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";


const contractAddresses = {
  //EverclearSpoke contract addresses for each chain
  ethereum: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816"], 
  optimism: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816"],
  bsc: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816"],
  unichain: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816"],
  polygon: ["0x7189C59e245135696bFd2906b56607755F84F3fD"],
  zksync: ["0x7F5e085981C93C579c865554B9b723B058AaE4D3"],
  ronin: ["0xdCA40903E271Cc76AECd62dF8d6c19f3Ac873E64"],
  base: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816"],
  apechain: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816"],
  mode: ["0xeFa6Ac3F931620fD0449eC8c619f2A14A0A78E99"],
  arbitrum: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816"],
  avalanche: ["0x9aA2Ecad5C77dfcB4f34893993f313ec4a370460"],
  zircuit: ["0xD0E86F280D26Be67A672d1bFC9bB70500adA76fe"],
  linea: ["0xc24dC29774fD2c1c0c5FA31325Bb9cbC11D8b751"],
  blast: ["0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7"],
  scroll: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816"],
  taiko: ["0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7"],
} as const;


const newIntent: PartialContractEventParams = {
  target: "",
  topic:
    "Settled(bytes32 _intentId, address _account, address _asset, uint256 _amount);",
  abi: [
    "event Settled(bytes32 _intentId, address _account, address _asset, uint256 _amount);",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "_amount",
    to: "_account",
    from: "_account",
    token: "_asset",
  },
  isDeposit: true,
};


/*
Withdrawal function is not needed for this use case.
*/


const constructParams = (chain: Chain) => {
  const chainConfig = contractAddresses[chain as keyof typeof contractAddresses];

  const eventParams: PartialContractEventParams[] = chainConfig.map(address => ({...newIntent, target: address}));

  return async (fromBlock: number, toBlock: number) => {
    console.log("Fetching Everclear bridge volume from block:", fromBlock, "to block:", toBlock)
    return getTxDataFromEVMEventLogs("everclear", chain, fromBlock, toBlock, eventParams);
  };
};

const adapter: BridgeAdapter = {
  ethereum:  constructParams("ethereum"),
  optimism:  constructParams("optimism"),
  bsc:       constructParams("bsc"),
  unichain:  constructParams("unichain"),
  polygon:   constructParams("polygon"),
  zksync:    constructParams("zksync"),
  ronin:     constructParams("ronin"),
  base:      constructParams("base"),
  apechain:  constructParams("apechain"),
  mode:      constructParams("mode"),
  arbitrum:  constructParams("arbitrum"),
  avalanche: constructParams("avalanche"),
  zircuit:   constructParams("zircuit"),
  linea:     constructParams("linea"),
  blast:     constructParams("blast"),
  scroll:    constructParams("scroll"),
  taiko:     constructParams("taiko"),
  //gnosis:    constructParams("xdai"),
  //metis:     constructParams("metis"),
};

export default adapter;