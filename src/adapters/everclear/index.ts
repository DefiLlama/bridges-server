import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { ethers } from "ethers";

const contractAddresses = {
  //EverclearSpoke contract addresses for each chain
  ethereum: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816"], 
  optimism: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816"],
  bsc: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816"],
  unichain: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816"],
  polygon: ["0x7189C59e245135696bFd2906b56607755F84F3fD"],
  zksync: ["0x7F5e085981C93C579c865554B9b723B058AaE4D3"],
  ronin: ["0xdCA40903E271Cc76AECd62dF8D6c19f3Ac873E64"],
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
  sonic: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816"],
  berachain: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816"],
  mantle: ["0xe0F010e465f15dcD42098dF9b99F1038c11B3056"],
  ink: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816"],
} as const;

// Helper function to convert bytes32 to address
function bytes32ToAddress(bytes32: string) {
  return ethers.utils.getAddress('0x' + bytes32.slice(26));
}

// Deposit event (IntentAdded)
const depositIntent: PartialContractEventParams = {
  target: "",
  topic: "IntentAdded(bytes32,bytes32,(bytes32,bytes32,bytes32,bytes32,uint24,uint32,uint64,uint48,uint48,uint256,uint32[],bytes))",
  abi: [
    "event IntentAdded(bytes32 indexed _intentId, bytes32 indexed _queueId, tuple(bytes32 initiator, bytes32 receiver, bytes32 inputAsset, bytes32 outputAsset, uint24 maxFee, uint32 origin, uint64 nonce, uint48 timestamp, uint48 ttl, uint256 amount, uint32[] destinations, bytes data) _intent)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "_intent.amount",
    from: "_intent.initiator",
    token: "_intent.inputAsset",
  },
  argGetters: {
    from: (logArgs: any) => bytes32ToAddress(logArgs._intent.initiator),
    token: (logArgs: any) => bytes32ToAddress(logArgs._intent.inputAsset)
  },
  isDeposit: true,
};

// Withdrawal event (Settled)
const withdrawalIntent: PartialContractEventParams = {
  target: "",
  topic: "Settled(bytes32,address,address,uint256)",
  abi: [
    "event Settled(bytes32 indexed _intentId, address _account, address _asset, uint256 _amount)",
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
  isDeposit: false,
};

const constructParams = (chain: Chain) => {
  const chainConfig = contractAddresses[chain as keyof typeof contractAddresses];

  // Create event params for both deposit and withdrawal events for each contract address
  const eventParams: PartialContractEventParams[] = [];
  
  // Add deposit (IntentAdded) events
  chainConfig.forEach(address => {
    eventParams.push({...depositIntent, target: address});
  });
  
  // Add withdrawal (Settled) events
  chainConfig.forEach(address => {
    eventParams.push({...withdrawalIntent, target: address});
  });

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
  sonic:     constructParams("sonic"),
  berachain: constructParams("berachain"),
  mantle:    constructParams("mantle"),
  ink:       constructParams("ink"),
};

export default adapter;