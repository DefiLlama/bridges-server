import { BridgeAdapter, ContractEventParams, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { Chain } from "@defillama/sdk/build/general";
import { ethers } from "ethers";

/*
'ercBridge' receives deposits of native and wrapped tokens and sends native asset withdrawals
'withdrawals' is interacted with for all withdrawals, both native and wrapped
'nativeHelper' converts native token to wrapped version for deposits. No native token withdrawals I think.
*/

const contractAddresses = {
  ethereum: {
    v1: {
      ercBridge: "0x6a39909e805A3eaDd2b61fFf61147796ca6aBB47",
      withdrawals: "0x07b5B57b08202294E657D51Eb453A189290f6385",
      nativeHelper: "0xf1c1413096ff2278C3Df198a28F8D54e0369cF3A",
    },
    v2: {
      ercBridge: "0x4fc16De11deAc71E8b2Db539d82d93BE4b486892",
      withdrawals: "0x27658c5556A9a57f96E69Bbf6d3B8016f001a785",
      nativeHelper: "0x2784a755690453035f32Ac5e28c52524d127AfE2",
    },
    nativeToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  polygon: {
    v1: {
      ercBridge: "0xf244eA81F715F343040569398A4E7978De656bf6",
      withdrawals: "0x681Edb6d52138cEa8210060C309230244BcEa61b",
      nativeHelper: "0xc494bFEE14b5E1E118F93CfedF831f40dFA720fA",
    },
    v2: {
      ercBridge: "0x3a5846882C0d5F8B0FA4bB04dc90C013104d125d",
      withdrawals: "0x45d35f60ccf8f7031fb5a09954cd923a9e84f89d",
      nativeHelper: "0xa489b8981ae5652C9Dd6515848cB8Dbecae5E1B0",
    },
    nativeToken: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  },
  celo: {
    v1: {
      ercBridge: "0xf244eA81F715F343040569398A4E7978De656bf6",
      withdrawals: "0xf25C5932bb6EFc7afA4895D9916F2abD7151BF97",
    },
    v2: {
      ercBridge: "0x1548cf5cf7dBd93f4dA11f45fCce315573d21B60",
      withdrawals: "0xfde0a96468ae91B4E13794E1B8e5B222E7Db6a23",
    },
    nativeToken: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  },
} as {
  [chain: string]: {
    v1: {
      ercBridge: string;
      withdrawals: string;
      nativeHelper?: string;
    };
    v2: {
      ercBridge: string;
      withdrawals: string;
      nativeHelper?: string;
    };
    nativeToken: string;
  };
};

const nativeDepositParams: PartialContractEventParams = {
  target: null,
  topic: "Transfer(address,address,uint256)",
  topics: [],
  abi: ["event Transfer(address indexed from, address indexed to, uint256 value)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  txKeys: {
    from: "from",
  },
  argKeys: {
    amount: "value",
  },
  fixedEventData: {
    to: "",
    token: "",
  },
  isDeposit: true,
};

const depositParams: ContractEventParams = {
  target: "",
  topic: "Send(address,address,uint32,bytes32,uint256)",
  abi: [
    "event Send(address indexed token, address indexed from, uint32 indexed toDomain, bytes32 toId, uint256 amount)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "token",
    from: "from",
    amount: "amount",
  },
  fixedEventData: {
    to: "",
  },
  isDeposit: true,
};

const withdrawalParams: ContractEventParams = {
  target: "",
  topic: "Process(bytes32,bool,bytes)",
  abi: ["event Process(bytes32 indexed messageHash, bool indexed success, bytes indexed returnData)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  fixedEventData: {
    from: "",
  },
  txKeys: {
    to: "from", // seems to work, don't know if it is always correct or not
  },
  getTokenFromReceipt: {
    token: true,
    amount: true,
  },
  isDeposit: false,
};

/*
Was used but no longer needed.

const v1DepositParams: PartialContractEventParams = {
  target: null,
  topic: "Transfer(address,address,uint256)",
  topics: [],
  abi: ["event Transfer(address indexed from, address indexed to, uint256 value)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
    token: "address",
  },
  txKeys: {
    from: "from"
  },
  argKeys: {
    amount: "value",
  },
  fixedEventData: {
    to: "",
  },
  filter: {
    excludeFrom: [""]
  },
  isDeposit: true,
};
*/

const constructParams = (chain: string) => {
  const eventParams = [] as any;
  const chainAddresses = contractAddresses[chain];
  const { v1, v2, nativeToken } = chainAddresses;

  if (chain === "celo") {
    [v1, v2].map(({ ercBridge, withdrawals }) => {
      const finalDepositParams = {
        ...depositParams,
        target: ercBridge,
        fixedEventData: {
          to: ercBridge,
        },
      };
      const finalWithdrawalParams = {
        ...withdrawalParams,
        target: withdrawals,
        fixedEventData: {
          from: withdrawals,
        },
      };
      eventParams.push(finalDepositParams, finalWithdrawalParams);
    });
  } else {
    [v1, v2].map(({ ercBridge, withdrawals, nativeHelper }) => {
      const finalNativeDepositParams = {
        ...nativeDepositParams,
        topics: [ethers.utils.id("Transfer(address,address,uint256)"), null, ethers.utils.hexZeroPad(ercBridge, 32)],
        fixedEventData: {
          to: ercBridge,
          token: nativeToken,
        },
        filter: {
          includeArg: [
            {
              from: nativeHelper,
            },
          ],
        },
      };
      const finalDepositParams = {
        ...depositParams,
        target: ercBridge,
        fixedEventData: {
          to: ercBridge,
        },
        filter: {
          excludeArg: [{ from: nativeHelper }],
        },
      };
      const finalWithdrawalParams = {
        ...withdrawalParams,
        target: withdrawals,
        fixedEventData: {
          from: withdrawals,
        },
      };
      eventParams.push(finalNativeDepositParams, finalDepositParams, finalWithdrawalParams);
    });
  }

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("optics", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  celo: constructParams("celo")
};

export default adapter;
