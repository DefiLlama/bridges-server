import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getEVMEventLogs } from "../../helpers/eventLogs";
import { constructTransferParams } from "../../helpers/eventParams";

/*
***Ethereum***
0x3ee18B2214AFF97000D974cf647E7C347E8fa585 is Wormhole: Portal Token Bridge
-it has no events! so can't get txs where ETH is deposited/withdrawn.
-erc's should be no problem.

***Polygon***

***Fantom***

***Avalanche***

***BSC***

*/

const contractAddresses = {
  ethereum: {
  },
  polygon: {
  },
  fantom: {
  },
  avax: {
  },
  bsc: {
  },
} as { [chain: string]: any }; // fix

const routerWithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "LogAnySwapIn(bytes32,address,address,uint256,uint256,uint256)",
  abi: [
    "event LogAnySwapIn(bytes32 indexed txhash, address indexed token, address indexed to, uint256 amount, uint256 fromChainID, uint256 toChainID)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "token",
    amount: "amount",
    to: "to",
  },
  fixedEventData: {
    from: "",
  },
  isDeposit: false,
};

const routerDepositParams: PartialContractEventParams = {
  target: "",
  topic: "LogAnySwapOut(address,address,address,uint256,uint256,uint256)",
  abi: [
    "event LogAnySwapOut(address indexed token, address indexed from, address indexed to, uint256 amount, uint256 fromChainID, uint256 toChainID)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "token",
    amount: "amount",
    from: "from",
  },
  fixedEventData: {
    to: "",
  },
  isDeposit: true,
};

const constructParams = (chain: string) => {
  let eventParams = [] as any;
  const chainAddresses = contractAddresses[chain];
  if (chainAddresses.routers) {
    chainAddresses.routers.map((address: string) => {
      const finalRouterWithdrawalParams = {
        ...routerWithdrawalParams,
        target: address,
        fixedEventData: {
          from: address,
        },
      };
      const finalRouterDepositParams = {
        ...routerDepositParams,
        target: address,
        fixedEventData: {
          to: address,
        },
      };
      eventParams.push(finalRouterWithdrawalParams, finalRouterDepositParams);
    });
  }
  return async (fromBlock: number, toBlock: number) =>
    getEVMEventLogs("portal", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  /*
  polygon: constructParams("polygon"),
  fantom: constructParams("fantom"),
  avalanche: constructParams("avax"),
  bsc: constructParams("bsc"),
  */
};

export default adapter;
