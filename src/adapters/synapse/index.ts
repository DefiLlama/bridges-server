import {
  BridgeAdapter,
  ContractEventParams,
  PartialContractEventParams,
} from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getEVMEventLogs } from "../../helpers/eventLogs";
import { Chain } from "@defillama/sdk/build/general";

/*
***Ethereum***
0x6571d6be3d8460CF5F7d6711Cd9961860029D85F Synapse Bridge Zap 3
-deposits of: 
  -USDC, USDT, DAI (swapped for nUSD); nUSD (ignore)
  -SYN (burned) 
  -WETH and all other tokens are forwarded to Synapse: Bridge

0x2796317b0fF8538F253012862c06787Adfb8cEb6 Synapse: Bridge
-withdrawals of: 
  -ETH via TokenWithdraw
  -all other tokens via TokenWithdrawAndRemove 
    TokenWithdrawAndRemove does not give which token is withdrawn, so instead can look at all 
    withdrawals and filter nUSD withdrawals.

***Polygon***
0x1c6aE197fF4BF7BA96c66C5FD64Cb22450aF9cC8 Synapse Bridge Zap 1
-deposits of:
  -USDC, USDT, DAI (swapped for nUSD); nUSD (ignore)
  -all other tokens (burned)

0x8F5BBB2BB8c2Ee94639E55d5F41de9b4839C1280 Synapse Bridge
-withdrawals of all tokens (ignore nUSD)

0x85fCD7Dd0a1e1A9FCD5FD886ED522dE8221C3EE5 Synapse FlashSwapLoan, seems to only be involved in swaps
*/

const ethereumDepositParams: PartialContractEventParams =
  constructTransferParams(
    "0x6571d6be3d8460CF5F7d6711Cd9961860029D85F",
    true,
    {
      excludeToken: [
        "0x1B84765dE8B7566e4cEAF4D0fD3c5aF52D3DdE4F", // nUSD
        "0x0f2D719407FdBeFF09D87557AbB7232601FD9F29", // SYN
      ],
    }
  );

const ethereumETHWithdrawalParams: ContractEventParams = {
  target: "0x2796317b0fF8538F253012862c06787Adfb8cEb6",
  topic: "TokenWithdraw(address,address,uint256,uint256,bytes32)",
  abi: [
    "event TokenWithdraw(address indexed to, address token, uint256 amount, uint256 fee, bytes32 indexed kappa)",
  ],
  argKeys: {
    token: "token",
    amount: "amount",
    to: "to",
  },
  isDeposit: false,
  filter: {
    includeToken: ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"], // WETH
  },
};

const ethereumWithdrawalParams: PartialContractEventParams =
  constructTransferParams(
    "0x2796317b0fF8538F253012862c06787Adfb8cEb6",
    false,
    { excludeToken: ["0x1B84765dE8B7566e4cEAF4D0fD3c5aF52D3DdE4F"] } // nUSD
  );

const polygonDepositParams: PartialContractEventParams =
  constructTransferParams(
    "0x1c6aE197fF4BF7BA96c66C5FD64Cb22450aF9cC8",
    true,
    {
      excludeToken: [
        "0xB6c473756050dE474286bED418B77Aeac39B02aF", // nUSD
      ],
    }
  );

const polygonWithdrawalParams: PartialContractEventParams =
  constructTransferParams(
    "0x8F5BBB2BB8c2Ee94639E55d5F41de9b4839C1280",
    false,
    { excludeToken: ["0xB6c473756050dE474286bED418B77Aeac39B02aF"] } // nUSD
  );

const constructParams = (chain: Chain) => {
  const eventParams = {
    ethereum: [
      ethereumDepositParams,
      ethereumETHWithdrawalParams,
      ethereumWithdrawalParams,
    ],
    polygon: [polygonDepositParams, polygonWithdrawalParams],
  } as any;
  return async (fromBlock: number, toBlock: number) =>
  getEVMEventLogs("synapse", chain, fromBlock, toBlock, eventParams[chain]);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
};

export default adapter;
