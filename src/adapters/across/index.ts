import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { ethers } from "ethers";

/*
Contracts: https://github.com/across-protocol/contracts-v2/blob/master/deployments/README.md
https://docs.across.to/v/developer-docs/developers/contract-addresses

For all tokens using 'spokepool' contracts:
  -deposits via FundsDeposited event
  -withdrawals via FilledRelay event
*/

const contracts = {
  // Chain id: 1
  ethereum: {
    spokePoolv2: "0x4D9079Bb4165aeb4084c526a32695dCfd2F77381",
    spokePoolv2p5: "0x5c7BCd6E7De5423a257D81B442095A1a6ced35C5",
  },
  // Chain id: 10
  optimism: {
    spokePoolv2: "0xa420b2d1c0841415A695b81E5B867BCD07Dff8C9",
    spokePoolv2p5: "0x6f26Bf09B1C792e3228e5467807a900A503c0281",
  },
  // Chain id: 137
  polygon: {
    spokePoolv2: "0x69B5c72837769eF1e7C164Abc6515DcFf217F920",
    spokePoolv2p5: "0x9295ee1d8C5b022Be115A2AD3c30C72E34e7F096",
  },
  // Chain id: 324
  era: {
    spokePoolv2p5: "0xE0B015E54d54fc84a6cB9B666099c46adE9335FF",
  },
  // Chain id: 1135 (TODO: Add Lisk to llama-sdk first)
  // lisk: {
  //  spokePoolv2p5: "0x9552a0a6624A23B848060AE5901659CDDa1f83f8",
  // },
  // Chain id: 8453
  base: {
    spokePoolv2p5: "0x09aea4b2242abC8bb4BB78D537A67a245A7bEC64",
  },
  // Chain id: 34443
  mode: {
    spokePoolv2p5: "0x3baD7AD0728f9917d1Bf08af5782dCbD516cDd96",
  },
  // Chain id: 42161
  arbitrum: {
    spokePoolv2: "0xB88690461dDbaB6f04Dfad7df66B7725942FEb9C",
    spokePoolv2p5: "0xe35e9842fceaCA96570B734083f4a58e8F7C5f2A",
  },
  // Chain id: 59144
  linea: {
    spokePoolv2p5: "0x7E63A5f1a8F0B4d0934B2f2327DAED3F6bb2ee75",
  },
  // Chain id: 81457
  blast: {
    spokePoolv2p5: "0x2D509190Ed0172ba588407D4c2df918F955Cc6E1",
  },
  // Chain id: 534352
  scroll: {
    spokePoolv2p5: "0x3baD7AD0728f9917d1Bf08af5782dCbD516cDd96",
  }
} as const;

type SupportedChains = keyof typeof contracts;

// Add helper function
function bytes32ToAddress(bytes32: string) {
  return ethers.utils.getAddress('0x' + bytes32.slice(26));
}

// "Version 3.5" events
const depositParamsv3p5: PartialContractEventParams = {
  target: "",
  topic: "FundsDeposited(bytes32,bytes32,uint256,uint256,uint256,uint256,uint32,uint32,uint32,bytes32,bytes32,bytes32,bytes)",
  abi: [
    "event FundsDeposited(bytes32 inputToken, bytes32 outputToken, uint256 inputAmount, uint256 outputAmount, uint256 indexed destinationChainId, uint256 indexed depositId, uint32 quoteTimestamp, uint32 fillDeadline, uint32 exclusivityDeadline, bytes32 indexed depositor, bytes32 recipient, bytes32 exclusiveRelayer, bytes message)"
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "inputAmount",
    token: "inputToken",
  },
  argGetters: {
    to: (logArgs: any) => bytes32ToAddress(logArgs.recipient),
    from: (logArgs: any) => bytes32ToAddress(logArgs.depositor),
  },
  isDeposit: true,
};

const relaysParamsv3p5: PartialContractEventParams = {
  target: "",
  topic:
    "FilledRelay(bytes32,bytes32,uint256,uint256,uint256,uint256,uint256,uint32,uint32,bytes32,bytes32,bytes32,bytes32,bytes32,(bytes32,bytes32,uint256,uint8))",
  abi: [
    "event FilledRelay(bytes32 inputToken, bytes32 outputToken, uint256 inputAmount, uint256 outputAmount, uint256 repaymentChainId, uint256 indexed originChainId, uint256 indexed depositId, uint32 fillDeadline, uint32 exclusivityDeadline, bytes32 exclusiveRelayer, bytes32 indexed relayer, bytes32 depositor, bytes32 recipient, bytes32 messageHash, tuple(bytes32 updatedRecipient, bytes32 updatedMessageHash, uint256 updatedOutputAmount, uint8 fillType)  relayExecutionInfo)"
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "outputAmount",
    token: "outputToken",
  },
  argGetters: {
    to: (logArgs: any) => bytes32ToAddress(logArgs.recipient),
    from: (logArgs: any) => bytes32ToAddress(logArgs.depositor),
  },
  isDeposit: false,
};

// "Version 3" events
const depositParamsv3: PartialContractEventParams = {
  target: "",
  topic: "V3FundsDeposited(address,address,uint256,uint256,uint256,uint32,uint32,uint32,uint32,address,address,address,bytes)",
  abi: [
    "event V3FundsDeposited(address inputToken,address outputToken,uint256 inputAmount,uint256 outputAmount,uint256 indexed destinationChainId,uint32 indexed depositId,uint32 quoteTimestamp,uint32 fillDeadline,uint32 exclusivityDeadline,address indexed depositor,address recipient,address exclusiveRelayer,bytes message)"
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "inputAmount",
    to: "recipient",
    from: "depositor",
    token: "inputToken",
  },
  isDeposit: true,
};

const relaysParamsv3: PartialContractEventParams = {
  target: "",
  topic:
    "FilledV3Relay(address,address,uint256,uint256,uint256,uint256,uint32,uint32,uint32,address,address,address,address,bytes,(address,bytes,uint256,uint8))",
  abi: [
    "event FilledV3Relay(address inputToken, address outputToken, uint256 inputAmount, uint256 outputAmount, uint256 repaymentChainId, uint256 indexed originChainId, uint32 indexed depositId, uint32 fillDeadline, uint32 exclusivityDeadline, address exclusiveRelayer, address indexed relayer, address depositor, address recipient, bytes message, tuple(address updatedRecipient, bytes updatedMessage, uint256 updatedOutputAmount, uint8 fillType) relayExecutionInfo)"
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "outputAmount",
    to: "recipient",
    from: "depositor",
    token: "outputToken",
  },
  isDeposit: false,
};

// "Version 2.5" events
const depositParamsv2p5: PartialContractEventParams = {
  target: "",
  topic: "FundsDeposited(uint256,uint256,uint256,int64,uint32,uint32,address,address,address,bytes)",
  abi: [
    "event FundsDeposited(uint256 amount, uint256 originChainId, uint256 indexed destinationChainId, int64 relayerFeePct, uint32 indexed depositId, uint32 quoteTimestamp, address originToken, address recipient, address indexed depositor, bytes message)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "amount",
    to: "recipient",
    from: "depositor",
    token: "originToken",
  },
  isDeposit: true,
};

const relaysParamsv2p5: PartialContractEventParams = {
  target: "",
  topic:
    "FilledRelay(uint256,uint256,uint256,uint256,uint256,uint256,int64,int64,uint32,address,address,address,address,bytes,(address,bytes,int64,bool,int256))",
  abi: [
    "event FilledRelay(uint256 amount, uint256 totalFilledAmount, uint256 fillAmount, uint256 repaymentChainId, uint256 indexed originChainId, uint256 destinationChainId, int64 relayerFeePct, int64 realizedLpFeePct, uint32 indexed depositId, address destinationToken,address relayer,address indexed depositor, address recipient, bytes message, tuple(address recipient, bytes message, int64 relayerFeePct, bool isSlowRelay, int256 payoutAdjustmentPct) updatableRelayData)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "fillAmount",
    to: "recipient",
    from: "depositor",
    token: "destinationToken",
  },
  isDeposit: false,
};

// "Version 2" events
const depositParamsv2: PartialContractEventParams = {
  target: "",
  topic: "FundsDeposited(uint256,uint256,uint256,uint64,uint32,uint32,address,address,address)",
  abi: [
    "event FundsDeposited(uint256 amount, uint256 originChainId, uint256 destinationChainId, uint64 relayerFeePct, uint32 indexed depositId, uint32 quoteTimestamp, address indexed originToken, address recipient, address indexed depositor)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "amount",
    to: "recipient",
    from: "depositor",
    token: "originToken",
  },
  isDeposit: true,
};

const relaysParamsv2: PartialContractEventParams = {
  target: "",
  topic:
    "FilledRelay(uint256,uint256,uint256,uint256,uint256,uint256,uint64,uint64,uint64,uint32,address,address,address,address,bool)",
  abi: [
    "event FilledRelay(uint256 amount, uint256 totalFilledAmount, uint256 fillAmount, uint256 repaymentChainId, uint256 originChainId, uint256 destinationChainId, uint64 relayerFeePct, uint64 appliedRelayerFeePct, uint64 realizedLpFeePct, uint32 depositId, address destinationToken,address indexed relayer,address indexed depositor, address recipient, bool isSlowRelay)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "fillAmount",
    to: "recipient",
    from: "depositor",
    token: "destinationToken",
  },
  isDeposit: false,
};

const constructParams = (chain: SupportedChains) => {
  const eventParams: PartialContractEventParams[] = [];

  const chainConfig = contracts[chain];

  // Old Spoke Pools
  if ("spokePoolv2" in chainConfig) {
    const finalDepositParamsv2 = {
      ...depositParamsv2,
      target: chainConfig.spokePoolv2,
    };
    eventParams.push(finalDepositParamsv2);

    const finalRelaysParamsv2 = {
      ...relaysParamsv2,
      target: chainConfig.spokePoolv2,
    };
    eventParams.push(finalRelaysParamsv2);
  }

  // New Spoke Pools
  if ("spokePoolv2p5" in chainConfig) {
    // "Version 2.5" events
    const finalDepositParamsv2p5 = {
      ...depositParamsv2p5,
      target: chainConfig.spokePoolv2p5,
    };
    eventParams.push(finalDepositParamsv2p5);

    const finalRelaysParamsv2p5 = {
      ...relaysParamsv2p5,
      target: chainConfig.spokePoolv2p5,
    };
    eventParams.push(finalRelaysParamsv2p5);

    // "Version 3" events
    // The v2.5 spoke pools are ProxyContracts that can be upgraded -- Across
    // reuses these spoke addresses for v3 with the modified events
    const finalDepositParamsv3 = {
      ...depositParamsv3,
      target: chainConfig.spokePoolv2p5,
    };
    eventParams.push(finalDepositParamsv3);

    const finalRelaysParamsv3 = {
      ...relaysParamsv3,
      target: chainConfig.spokePoolv2p5,
    };
    eventParams.push(finalRelaysParamsv3);

    // "Version 3.5" events
    // The v2.5 spoke pools are ProxyContracts that can be upgraded -- Across
    // reuses these spoke addresses for v3.5 with the modified events
    const finalDepositParamsv3p5 = {
      ...depositParamsv3p5,
      target: chainConfig.spokePoolv2p5,
    };
    eventParams.push(finalDepositParamsv3p5);

    const finalRelaysParamsv3p5 = {
      ...relaysParamsv3p5,
      target: chainConfig.spokePoolv2p5,
    };
    eventParams.push(finalRelaysParamsv3p5);
  }

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("across", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  optimism: constructParams("optimism"),
  polygon: constructParams("polygon"),
  "zksync era": constructParams("era"),
  // lisk: constructParams("lisk"),
  base: constructParams("base"),
  mode: constructParams("mode"),
  arbitrum: constructParams("arbitrum"),
  linea: constructParams("linea"),
  blast: constructParams("blast"),
  scroll: constructParams("scroll"),
};

export default adapter;
