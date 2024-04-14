import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { Chain } from "@defillama/sdk/build/general";

const routerAddress = "0xe1c14b9f065dead2e89ee35382f8bd42bdb87a04";

const nativeTokens: Record<string, string> = {
  ethereum: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  arbitrum: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  optimism: "0x4200000000000000000000000000000000000006",
  base: "0x4200000000000000000000000000000000000006",
  polygon: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
  avax: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
};

const constructParams = (chain: string) => {
  let eventParams = [] as any;
  const transferWithdrawalParams: PartialContractEventParams = {
    target: routerAddress,
    topic: "MessageSent(bytes32,uint64,address,bytes,address,uint256,uint256,address,uint256)",
    abi: [
      "event MessageSent(bytes32 indexed messageId, uint64 indexed destinationChainSelector, address indexed sender, bytes data, address token, uint256 tokenAmount, uint256 valueForInstantCcipRecieve, address transferedToken, uint256 transferedTokenAmount)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      from: "sender",
      token: "token",
      amount: "tokenAmount",
    },

    fixedEventData: {
      to: routerAddress,
    },
    isDeposit: true,
  };
  const transferDepositParams: PartialContractEventParams = {
    target: routerAddress,
    topic: "MessageReceived(bytes32,uint64,address,bytes,address,uint256)",
    abi: [
      "event MessageReceived(bytes32 indexed messageId, uint64 indexed sourceChainSelector, address indexed sender, bytes data, address token, uint256 tokenAmount)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      to: "sender",
      token: "token",
      amount: "tokenAmount",
    },
    fixedEventData: {
      from: routerAddress,
    },
    isDeposit: false,
  };
  eventParams.push(transferWithdrawalParams, transferDepositParams);

  return async (fromBlock: number, toBlock: number) => {
    const eventLogData = await getTxDataFromEVMEventLogs("xswap", chain as Chain, fromBlock, toBlock, eventParams);

    return eventLogData.map((event) => {
      if (event.token === "0x0000000000000000000000000000000000000000") {
        event.token = nativeTokens[chain];
      }
      return event;
    });
  };
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  avalanche: constructParams("avax"),
  arbitrum: constructParams("arbitrum"),
  base: constructParams("base"),
  optimism: constructParams("optimism"),
};

export default adapter;
