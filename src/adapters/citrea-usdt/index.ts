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
    oapp: "0x6925ccD29e3993c82a574CED4372d8737C6dbba6",
    token: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
  }],
  citrea: [{
    oapp: "0xF8b5983BFa11dc763184c96065D508AE1502C030",
    token: "0x9f3096Bac87e7F03DC09b0B416eB0DF837304dc4", // USDT.e
  }],
} satisfies Record<Chain, Deployment[]>;

// See citrea-usdc/index.ts for an explanation of why we only index OFTSent and
// flag isDeposit by direction (TO Citrea = Deposit, FROM Citrea = Withdraw).
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
    getTxDataFromEVMEventLogs("citrea-usdt", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = Object.fromEntries(
  (Object.keys(deployments) as Array<keyof typeof deployments>).map((chain) => [chain, constructParams(chain)])
);

export default adapter;
