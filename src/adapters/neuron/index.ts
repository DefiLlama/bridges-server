import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, ContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { ethers } from "ethers";

const gatewayAddresses = {
  arbitrum: "0x2395e53b250f091f38858ca9e75398181d45682b",
  linea: "0x2395e53b250f091f38858ca9e75398181d45682b",
  optimism: "0x2395e53b250f091f38858ca9e75398181d45682b",
  base: "0xe204912f188514ab33ba75c96bc81fe973db1046",
} as {
  [chain: string]: string;
};

const constructParams = (chain: string) => {
  const chainAddress = gatewayAddresses[chain];
  const depositParams: ContractEventParams = {
      target: null,
      topic: "depositNative(string)",
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
        to: "address",
      },
      argKeys: {
        from: "user",
        amount: "amount",
        token: "token",
      },
      abi: ["event Deposit (address indexed user, address indexed token, uint256 amount, string payload)"],
      topics: [
        ethers.utils.hexZeroPad("0xef519b7eb82aaf6ac376a6df2d793843ebfd593de5f1a0601d3cc6ab49ebb395", 32),
      ],
      filter: {
        includeTxData: [{ to: chainAddress }]
      },
      isDeposit: true,
  };
  
  let eventParams = [] as any;

  eventParams.push(depositParams);

  return async (fromBlock: number, toBlock: number) =>
    await getTxDataFromEVMEventLogs("neuron", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  arbitrum: constructParams("arbitrum"),
  linea: constructParams("linea"),
  optimism: constructParams("optimism"),
  base: constructParams("base"),
};

export default adapter;
