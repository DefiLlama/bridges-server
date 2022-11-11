import { BridgeAdapter, ContractEventParams, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";
import { ethers } from "ethers";

/*
Contracts: https://docs.debridge.finance/contracts/mainnet-addresses
Analytics: https://explorer.debridge.finance/analytics

debridgeGate contract emits the following events, however, I had difficulty getting the token sent from them:
MonitoringSendEvent (bytes32 submissionId, uint256 nonce, uint256 lockedOrMintedAmount, uint256 totalSupply)
MonitoringClaimEvent (bytes32 submissionId, uint256 lockedOrMintedAmount, uint256 totalSupply)
Claimed (bytes32 submissionId, index_topic_1 bytes32 debridgeId, uint256 amount, index_topic_2 address receiver, uint256 nonce, index_topic_3 uint256 chainIdFrom, bytes autoParams, bool isNativeToken)

For deposits/withdrawals (except native ETH), tokens are swapped to/from USDC or WETH and xfer'd to debridgeGate.
So it is possible to get all the txs and volume easily just looking at debridgeGate xfers (just need to filter out fee txs when doing so).
However, it's more difficult to get the initial/final token if using this approach:
-can get it from input data for txs that are via deSwapSender
-for txs that are via 0x6d7a3177f3500bea64914642a49d0b5c0a7dae6d (first, token is swapped through deSwapReceiver),
  contract is not verified, so can't get input data, no simple way to get output token.
*/

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const contractAddresses = {
  ethereum: {
    debridgeGate: "0x43dE2d77BF8027e25dBD179B491e8d64f38398aA",
  },
} as {
  [chain: string]: {
    debridgeGate: string;
  };
};

const testDepositParams: PartialContractEventParams = constructTransferParams(
  "0x43dE2d77BF8027e25dBD179B491e8d64f38398aA",
  true
);
const testWithdrawalParams: PartialContractEventParams = constructTransferParams(
  "0x43dE2d77BF8027e25dBD179B491e8d64f38398aA",
  false,
  { excludeTo: ["0x6D7A3177f3500BEA64914642a49D0B5C0a7Dae6D"] }
);

// routerCallNative
const routerCalldepositParams: ContractEventParams = {
  target: null,
  topic: "Transfer(address,address,uint256)",
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "from",
    to: "to",
  },
  txKeys: {
    amount: "value",
  },
  fixedEventData: {
    token: WETH,
  },
  abi: ["event Transfer(address indexed from, address indexed to, uint256 value)"],
  topics: [
    ethers.utils.id("Transfer(address,address,uint256)"),
    null,
    ethers.utils.hexZeroPad("0x43dE2d77BF8027e25dBD179B491e8d64f38398aA", 32),
  ],
  functionSignatureFilter: {
    includeSignatures: ["0x060203"],
  },
  isDeposit: true,
};

// swapAndSendV2
const swapV2DepositParams: ContractEventParams = {
  target: null,
  topic: "Transfer(address,address,uint256)",
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  txKeys: {
    from: "from",
    to: "to",
  },
  inputDataExtraction: {
    inputDataABI: [
      "function swapAndSendV2(address _srcTokenIn, uint256 _srcAmountIn, bytes _srcTokenInPermit, address _srcSwapRouter, bytes _srcSwapCalldata, address _srcTokenOut, tuple(uint256 chainId, address receiver, bool useAssetFee, uint32 referralCode, bytes autoParams) _gateParams) payable",
    ],
    inputDataFnName: "swapAndSendV2",
    inputDataKeys: {
      token: "_srcTokenIn",
      amount: "_srcAmountIn",
    },
  },
  abi: ["event Transfer(address indexed from, address indexed to, uint256 value)"],
  topics: [
    ethers.utils.id("Transfer(address,address,uint256)"),
    null,
    ethers.utils.hexZeroPad("0x43dE2d77BF8027e25dBD179B491e8d64f38398aA", 32),
  ],
  functionSignatureFilter: {
    includeSignatures: ["0x5dfd9b"],
  },
  isDeposit: true,
};

// swapAndSendV3
const swapV3DepositParams: ContractEventParams = {
  target: null,
  topic: "Transfer(address,address,uint256)",
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  txKeys: {
    from: "from",
    to: "to",
  },
  inputDataExtraction: {
    inputDataABI: [
      "function swapAndSendV3(address _srcTokenIn, uint256 _srcAmountIn, bytes _srcTokenInPermit, uint256 _affiliateFeeAmount, address _affiliateFeeRecipient, address _srcSwapRouter, bytes _srcSwapCalldata, address _srcTokenOut, tuple(uint256 chainId, address receiver, bool useAssetFee, uint32 referralCode, bytes autoParams) _gateParams) payable",
    ],
    inputDataFnName: "swapAndSendV3",
    inputDataKeys: {
      token: "_srcTokenIn",
      amount: "_srcAmountIn",
    },
  },
  abi: ["event Transfer(address indexed from, address indexed to, uint256 value)"],
  topics: [
    ethers.utils.id("Transfer(address,address,uint256)"),
    null,
    ethers.utils.hexZeroPad("0x43dE2d77BF8027e25dBD179B491e8d64f38398aA", 32),
  ],
  functionSignatureFilter: {
    includeSignatures: ["0x5c5c57"],
  },
  isDeposit: true,
};

// sendV2
const sendV2DepositParams: ContractEventParams = {
  target: "0x43dE2d77BF8027e25dBD179B491e8d64f38398aA",
  topic: "MonitoringSendEvent(bytes32,uint256,uint256,uint256)",
  abi: [
    "event MonitoringSendEvent(bytes32 submissionId, uint256 nonce, uint256 lockedOrMintedAmount, uint256 totalSupply)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  txKeys: {
    from: "from",
  },
  inputDataExtraction: {
    inputDataABI: [
      "function sendV2(address _srcTokenIn, uint256 _srcAmountIn, bytes _srcTokenInPermit, tuple(uint256 chainId, address receiver, bool useAssetFee, uint32 referralCode, bytes autoParams) _gateParams) payable",
    ],
    inputDataFnName: "sendV2",
    inputDataKeys: {
      token: "_srcTokenIn",
      amount: "_srcAmountIn",
    },
  },
  mapTokens: {
    "0x0000000000000000000000000000000000000000": WETH,
  },
  functionSignatureFilter: {
    includeSignatures: ["0x1624ea"],
  },
  fixedEventData: {
    to: "0x43dE2d77BF8027e25dBD179B491e8d64f38398aA",
  },
  isDeposit: true,
};

// need to separate by fn and extract "token" and "to" from input data
// and should probably use swapWithdrawalParams, not this
const withdrawalParams: ContractEventParams = {
  target: null,
  topic: "Transfer(address,address,uint256)",
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
    token: "address",
  },
  argKeys: {
    from: "from",
    to: "to",
    amount: "value",
  },
  abi: ["event Transfer(address indexed from, address indexed to, uint256 value)"],
  topics: [
    ethers.utils.id("Transfer(address,address,uint256)"),
    ethers.utils.hexZeroPad("0x43dE2d77BF8027e25dBD179B491e8d64f38398aA", 32),
  ],
  filter: { excludeTo: ["0x6D7A3177f3500BEA64914642a49D0B5C0a7Dae6D", "0x122fc7945dAd90144cba1f3f83cBeE912c0595D6"] },
  isDeposit: false,
};

/*
const swapWithdrawalParams: ContractEventParams = {
  target: "",
  topic: "MonitoringClaimEvent(bytes32,uint256,uint256)",
  abi: ["event MonitoringClaimEvent(bytes32 submissionId, uint256 lockedOrMintedAmount, uint256 totalSupply)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "lockedOrMintedAmount",
  },
  fixedEventData: {
    from: "",
  },
  isDeposit: false,
};
*/

const constructParams = (chain: string) => {
  let eventParams = [] as any;
  const chainAddresses = contractAddresses[chain];
  const debridgeGate = chainAddresses.debridgeGate;

  /*
  const finalSwapWithdrawalParams = {
    ...swapWithdrawalParams,
    target: debridgeGate,
    fixedEventData: {
      from: debridgeGate,
    },
  };
  */

  eventParams.push(withdrawalParams);

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("debridge", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  /*
  polygon: constructParams("polygon"),
  fantom: constructParams("fantom"),
  avalanche: constructParams("avax"),
  bsc: constructParams("bsc"),
  aurora: constructParams("aurora"),
  */
};

export default adapter;
