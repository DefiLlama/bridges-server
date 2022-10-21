import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";

/*
It appears that Stargate: Router does not emit swap events.
Other contracts involved may not help much.
May be easiest to track the transfers to each individual SG token contract.

For STG token contract, can track deposit/withdrawal events easily.

For the other SG token contracts, there are 2 types of deposits: normal deposits and swaps via 'widgetSwap'.
Using 'constructTransferParams' gives widgetSwap address as 'to'.
Could fix this, but would need to differentiate between the 2 types of txs.
*/

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const contractAddresses = {
  ethereum: {
    nativeToken: "0x72E2F4830b9E45d52F80aC08CB2bEC0FeF72eD9c",
    stg: "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6",
    ercs: [
      "0xdf0770dF86a8034b3EFEf0A1Bb3c889B8332FF56", // USDC
      "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    ],
  },
  polygon: {
    nativeToken: "",
    stg: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
    ercs: [
      "0x1205f31718499dBf1fCa446663B532Ef87481fe1", // USDC
      "0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c", // USDT
    ],
},
    bsc: {
      nativeToken: "",
      stg: "",
      ercs: [
        "", // USDC
        "", // USDT
        "", // STG
      ],
  },
  avax: {
    nativeToken: "",
    stg: "",
    ercs: [
      "", // USDC
      "", // USDT
      "", // STG
    ],
},
fantom: {
  nativeToken: "",
  stg: "",
  ercs: [
    "", // USDC
    "", // USDT
    "", // STG
  ],
},
arbitrum: {
  nativeToken: "",
  stg: "",
  ercs: [
    "", // USDC
    "", // USDT
    "", // STG
  ],
},
optimism: {
  nativeToken: "",
  stg: "",
  ercs: [
    "", // USDC
    "", // USDT
    "", // STG
  ],
},
} as {
  [chain: string]: {
    nativeToken?: string;
    stg: string;
    ercs: string[];
  };
};

const ethDepositParams: PartialContractEventParams = {
  target: "0x72E2F4830b9E45d52F80aC08CB2bEC0FeF72eD9c",
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
  fixedEventData: {
    token: WETH,
    to: "0x72E2F4830b9E45d52F80aC08CB2bEC0FeF72eD9c",
  },
  isDeposit: true,
};

const ethWithdrawalParams: PartialContractEventParams = {
  target: "0x72E2F4830b9E45d52F80aC08CB2bEC0FeF72eD9c",
  topic: "TransferNative(address,address,uint256)",
  abi: ["event TransferNative(address indexed src, address indexed dst, uint256 wad)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "wad",
  },
  txKeys: {
    to: "to",
  },
  fixedEventData: {
    token: WETH,
    from: "0x72E2F4830b9E45d52F80aC08CB2bEC0FeF72eD9c",
  },
  isDeposit: false,
};

const stgDepositParams: PartialContractEventParams = {
  target: "",
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
    token: "",
    to: "",
  },
  isDeposit: true,
};

const stgWithdrawalParams: PartialContractEventParams = {
  target: "",
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
    to: "to", // This does not give correct address. Cannot find contract containing fn that is called so I can extract the input data. Example contract interacted with: 0x75dC8e5F50C8221a82CA6aF64aF811caA983B65f (Polygon) 
  },
  fixedEventData: {
    token: "",
    from: "",
  },
  isDeposit: false,
};

const constructParams = (chain: string) => {
  let eventParams = [] as any;
  const nativeToken = contractAddresses[chain].nativeToken
  const ercs = contractAddresses[chain].ercs
  const stg = contractAddresses[chain].stg
  /*
  for (let address of ercs) {
  const depositEventParams: PartialContractEventParams =
  constructTransferParams(
    address,
    true
  );
const withdrawalEventParams: PartialContractEventParams =
  constructTransferParams(
    address,
    false
  );
  eventParams.push(depositEventParams, withdrawalEventParams)
  }
  */
  const finalStgDepositParams = {
    ...stgDepositParams,
    target: stg,
    fixedEventData: {
      token: stg,
      to: stg,
    },
  };
  const finalStgWithdrawalParams = {
    ...stgWithdrawalParams,
    target: stg,
    fixedEventData: {
      token: stg,
      from: stg,
    },
  };
  eventParams.push(finalStgDepositParams, finalStgWithdrawalParams);
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("stargate", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  //ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  //fantom: constructParams("fantom"),
  //avalanche: constructParams("avax"),
  //bsc: constructParams("bsc"),
  //arbitrum: constructParams("arbitrum"),
  //optimism: constructParams("optimism")
};

export default adapter;
