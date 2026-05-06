import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

type Address = `0x${string}`;

interface Deployment {
  oapp: Address;
  token: Address;
}

// On Ethereum the OFT is an OFTAdapter wrapping canonical WBTC.
// On Citrea the OFT is itself the WBTC.e ERC20 (oapp == token).
const deployments = {
  ethereum: [{
    oapp: "0x2c01390E10e44C968B73A7BcFF7E4b4F50ba76Ed",
    token: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
  }],
  citrea: [{
    oapp: "0xDF240DC08B0FdaD1d93b74d5048871232f6BEA3d",
    token: "0xDF240DC08B0FdaD1d93b74d5048871232f6BEA3d", // WBTC.e
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
    getTxDataFromEVMEventLogs("citrea-wbtc", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = Object.fromEntries(
  (Object.keys(deployments) as Array<keyof typeof deployments>).map((chain) => [chain, constructParams(chain)])
);

export default adapter;
