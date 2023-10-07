import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

/*
Contracts: https://github.com/across-protocol/contracts-v2/blob/master/deployments/README.md
https://docs.across.to/v/developer-docs/developers/contract-addresses

For all tokens using 'spokepool' contracts:
  -deposits via FundsDeposited event
  -withdrawals via FilledRelay event
*/

const contracts = {
  ethereum: {
    spokePoolv2: "0x4D9079Bb4165aeb4084c526a32695dCfd2F77381",
    spokePoolv2p5: "0x5c7BCd6E7De5423a257D81B442095A1a6ced35C5",
  },
  polygon: {
    spokePoolv2: "0x69B5c72837769eF1e7C164Abc6515DcFf217F920",
    spokePoolv2p5: "0x9295ee1d8C5b022Be115A2AD3c30C72E34e7F096",
  },
  arbitrum: {
    spokePoolv2: "0xB88690461dDbaB6f04Dfad7df66B7725942FEb9C",
    spokePoolv2p5: "0xe35e9842fceaCA96570B734083f4a58e8F7C5f2A",
  },
  optimism: {
    spokePoolv2: "0xa420b2d1c0841415A695b81E5B867BCD07Dff8C9",
    spokePoolv2p5: "0x6f26Bf09B1C792e3228e5467807a900A503c0281",
  },
  era: {
    spokePoolv2p5: "0xE0B015E54d54fc84a6cB9B666099c46adE9335FF",
  },
  base: {
    spokePoolv2p5: "0x09aea4b2242abC8bb4BB78D537A67a245A7bEC64",
  },
} as const;

type SupportedChains = keyof typeof contracts;

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
  }

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("across", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  arbitrum: constructParams("arbitrum"),
  optimism: constructParams("optimism"),
  "zksync era": constructParams("era"),
  base: constructParams("base"),
};

export default adapter;
