import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";
import { ethers } from "ethers";

/*
It appears that Stargate: Router does not emit swap events.
Other contracts involved may not help much.
May be easiest to track the transfers to each individual SG token contract.

Factories are here, should update adapter to get erc lists from them:
Ethereum: 0x06D538690AF257Da524f25D0CD52fD85b1c2173E
Polygon: 0x808d7c71ad2ba3FA531b068a2417C63106BC0949
BSC: 0x4a364f8c717cAAD9A442737Eb7b8A55cc6cf18D8
Avax: 0x808d7c71ad2ba3FA531b068a2417C63106BC0949
Fantom: 0x9d1B1669c73b033DFe47ae5a0164Ab96df25B944
Optimism: 0xE3B53AF74a4BF62Ae5511055290838050bf764Df
*/

const nullAddress = "0x0000000000000000000000000000000000000000";

const contractAddresses = {
  ethereum: {
    stg: "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6",
    ercs: [
      "0xdf0770dF86a8034b3EFEf0A1Bb3c889B8332FF56", // USDC
      "0x38ea452219524bb87e18de1c24d3bb59510bd783", // USDT
      "0x692953e758c3669290cb1677180c64183cEe374e", // USDD
    ],
    nativeToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    etherVault: "0x72E2F4830b9E45d52F80aC08CB2bEC0FeF72eD9c",
  },
  polygon: {
    stg: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
    ercs: [
      "0x1205f31718499dBf1fCa446663B532Ef87481fe1", // USDC
      "0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c", // USDT
    ],
  },
  bsc: {
    stg: "0xB0D502E938ed5f4df2E681fE6E419ff29631d62b",
    ercs: [
      "0x98a5737749490856b401DB5Dc27F522fC314A4e1", // BUSD
      "0x9aA83081AA06AF7208Dcc7A4cB72C94d057D2cda", // USDT
      "0x4e145a589e4c03cBe3d28520e4BF3089834289Df", // USDD
    ],
  },
  avax: {
    stg: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
    ercs: [
      "0x1205f31718499dBf1fCa446663B532Ef87481fe1", // USDC
      "0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c", // USDT
    ],
  },
  fantom: {
    stg: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
    ercs: [
      "0x12edeA9cd262006cC3C4E77c90d2CD2DD4b1eb97", // USDC
    ],
  },
  arbitrum: {
    stg: "0x6694340fc020c5E6B96567843da2df01b2CE1eb6",
    ercs: [
      "0x892785f33CdeE22A30AEF750F285E18c18040c3e", // USDC
      "0xB6CfcF89a7B22988bfC96632aC2A9D6daB60d641", // USDT
    ],
    nativeToken: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    etherVault: "0x82CbeCF39bEe528B5476FE6d1550af59a9dB6Fc0",
  },
  optimism: {
    stg: "0x296F55F8Fb28E498B858d0BcDA06D955B2Cb3f97",
    ercs: [
      "0xDecC0c09c3B5f6e92EF4184125D5648a66E35298", // USDC
    ],
    nativeToken: "0x4200000000000000000000000000000000000006",
    etherVault: "0xb69c8CBCD90A39D8D3d3ccf0a3E968511C3856A0",
  },
} as {
  [chain: string]: {
    stg: string;
    ercs: string[];
    nativeToken?: string;
    etherVault?: string;
  };
};

const ethDepositParams: PartialContractEventParams = {
  target: "",
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
  matchFunctionSignatures: ["0x1114cd"],
  fixedEventData: {
    token: "",
    to: "",
  },
  isDeposit: true,
};

const ethWithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "TransferNative(address,address,uint256)",
  abi: ["event TransferNative(address indexed src, address indexed dst, uint256 wad)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "wad",
    to: "dst",
  },
  fixedEventData: {
    token: "",
    from: "",
  },
  isDeposit: false,
};

const ethStgDepositParams: PartialContractEventParams = {
  target: "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6",
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
    token: "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6",
    to: "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6",
  },
  isDeposit: true,
};

const ethStgWithdrawalParams: PartialContractEventParams = {
  target: "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6",
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
    to: "to",
  },
  fixedEventData: {
    token: "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6",
    from: "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6",
  },
  isDeposit: false,
};

const stgDepositParams: PartialContractEventParams = {
  target: "",
  topic: "Transfer(address,address,uint256)",
  topics: [ethers.utils.id("Transfer(address,address,uint256)"), null, ethers.utils.hexZeroPad(nullAddress, 32)],
  abi: ["event Transfer(address indexed from, address indexed to, uint256 value)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
    token: "address",
  },
  argKeys: {
    from: "from",
    amount: "value",
  },
  fixedEventData: {
    token: "",
  },
  isDeposit: true,
};

const stgWithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "Transfer(address,address,uint256)",
  topics: [ethers.utils.id("Transfer(address,address,uint256)"), ethers.utils.hexZeroPad(nullAddress, 32)],
  abi: ["event Transfer(address indexed from, address indexed to, uint256 value)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
    token: "address",
  },
  argKeys: {
    to: "to",
    amount: "value",
  },
  fixedEventData: {
    token: "",
    from: "",
  },
  isDeposit: false,
};

/*
These are no longer needed.

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
*/

const constructParams = (chain: string) => {
  let eventParams = [] as any;
  const etherVault = contractAddresses[chain].etherVault;
  const nativeToken = contractAddresses[chain].nativeToken;
  const ercs = contractAddresses[chain].ercs;
  const stg = contractAddresses[chain].stg;
  if (etherVault) {
    const finalEthDepositParams = {
      ...ethDepositParams,
      target: etherVault,
      fixedEventData: {
        token: nativeToken,
        to: etherVault,
      },
    };
    const finalEthWithdrawalParams = {
      ...ethWithdrawalParams,
      target: etherVault,
      fixedEventData: {
        token: nativeToken,
        from: etherVault,
      },
    };
    eventParams.push(finalEthDepositParams, finalEthWithdrawalParams);
  }
  if (chain === "ethereum") {
    eventParams.push(ethStgDepositParams, ethStgWithdrawalParams);
  } else {
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
  }

  for (let address of ercs) {
    const depositEventParams: PartialContractEventParams = constructTransferParams(address, true);
    const withdrawalEventParams: PartialContractEventParams = constructTransferParams(address, false);
    eventParams.push(depositEventParams, withdrawalEventParams);
  }
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("stargate", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  fantom: constructParams("fantom"),
  avalanche: constructParams("avax"),
  bsc: constructParams("bsc"),
  arbitrum: constructParams("arbitrum"),
  optimism: constructParams("optimism"),
};

export default adapter;
