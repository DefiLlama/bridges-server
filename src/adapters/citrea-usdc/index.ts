import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

type Address = `0x${string}`;

interface Deployment {
  oapp: Address;
  token: Address;
}

const deployments = {
  ethereum: [{
    oapp: "0xdaa289CC487Cf95Ba99Db62f791c7E2d2a4b868E",
    token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
  }],
  citrea: [{
    oapp: "0x41710804caB0974638E1504DB723D7bddec22e30",
    token: "0xE045e6c36cF77FAA2CfB54466D71A3aEF7bbE839", // USDC.e
  }],
} satisfies Record<Chain, Deployment[]>;

// We only index OFTSent (the source-side event). For each cross-chain transfer
// there's also a matching OFTReceived on the destination chain — capturing both
// would double-count volume. By picking just OFTSent on each side and flagging
// isDeposit by direction (sending TO Citrea = Deposit, sending FROM Citrea =
// Withdraw), the bridge's Deposited/Withdrawn columns reflect actual one-way flow.
const sentEventParams = {
  topic: "OFTSent(bytes32,uint32,address,uint256,uint256)",
  abi: [
    "event OFTSent(bytes32 indexed guid, uint32 dstEid, address indexed fromAddress, uint256 amountSentLD, uint256 amountReceivedLD)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "fromAddress",
    amount: "amountSentLD",
  },
  isDeposit: true,
} satisfies Partial<PartialContractEventParams>;

const constructParams = (chain: keyof typeof deployments) => {
  const isDeposit = chain !== "citrea";

  const eventParams = deployments[chain].flatMap((deployment) => [
    {
      ...sentEventParams,
      target: deployment.oapp,
      isDeposit,
      fixedEventData: {
        token: deployment.token,
        to: deployment.token,
      },
    },
  ]);

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("citrea-usdc", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = Object.fromEntries(
  (Object.keys(deployments) as Array<keyof typeof deployments>).map((chain) => [chain, constructParams(chain)])
);

export default adapter;
