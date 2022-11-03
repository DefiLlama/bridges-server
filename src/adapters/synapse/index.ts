import { BridgeAdapter, ContractEventParams, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { Chain } from "@defillama/sdk/build/general";
import { ethers } from "ethers";

/*
***Ethereum***
0x6571d6be3d8460CF5F7d6711Cd9961860029D85F Synapse Bridge Zap 3
-deposits of: 
  -USDC, USDT, DAI (swapped for nUSD); nUSD (ignore)
  -SYN (burned) 
  -WETH and all other tokens are forwarded to Synapse: Bridge (WETH deposits can be recorded there)

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

^same goes for all other non-ethereum chains
*/

const contractAddresses = {
  polygon: {
    bridgeZap: "0x1c6aE197fF4BF7BA96c66C5FD64Cb22450aF9cC8",
    synapseBridge: "0x8F5BBB2BB8c2Ee94639E55d5F41de9b4839C1280",
    nusd: "0xB6c473756050dE474286bED418B77Aeac39B02aF",
  },
  fantom: {
    bridgeZap: "0xB003e75f7E0B5365e814302192E99b4EE08c0DEd",
    synapseBridge: "0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b",
    nusd: "0xED2a7edd7413021d440b09D654f3b87712abAB66",
  },
  avax: {
    bridgeZap: "0x0EF812f4c68DC84c22A4821EF30ba2ffAB9C2f3A",
    synapseBridge: "0xC05e61d0E7a63D27546389B7aD62FdFf5A91aACE",
    nusd: "0xCFc37A6AB183dd4aED08C204D1c2773c0b1BDf46",
  },
  bsc: {
    bridgeZap: "0x749F37Df06A99D6A8E065dd065f8cF947ca23697",
    synapseBridge: "0xd123f70AE324d34A9E76b67a27bf77593bA8749f",
    nusd: "0x23b891e5C62E0955ae2bD185990103928Ab817b3",
  },
  arbitrum: {
    bridgeZap: "0x37f9aE2e0Ea6742b9CAD5AbCfB6bBC3475b3862B",
    synapseBridge: "0x6F4e8eBa4D337f874Ab57478AcC2Cb5BACdc19c9",
    nusd: "0x2913E812Cf0dcCA30FB28E6Cac3d2DCFF4497688",
  },
  optimism: {
    bridgeZap: "0x470f9522ff620eE45DF86C58E54E6A645fE3b4A7",
    synapseBridge: "0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b",
    nusd: "0x67C10C397dD0Ba417329543c1a40eb48AAa7cd00",
  },
  aurora: {
    bridgeZap: "0x2D8Ee8d6951cB4Eecfe4a79eb9C2F973C02596Ed",
    synapseBridge: "0xaeD5b25BE1c3163c907a471082640450F928DDFE",
    nusd: "0x07379565cD8B0CaE7c60Dc78e7f601b34AF2A21c",
  },
} as {
  [chain: string]: {
    bridgeZap: string;
    synapseBridge: string;
    nusd: string;
  };
};

const ethereumDepositParams: PartialContractEventParams = constructTransferParams(
  "0x6571d6be3d8460CF5F7d6711Cd9961860029D85F",
  true,
  {
    excludeToken: [
      "0x1B84765dE8B7566e4cEAF4D0fD3c5aF52D3DdE4F", // nUSD
    ],
  }
);

const ethereumEthDepositParams: ContractEventParams = {
  target: null,
  topic: "Transfer(address,address,uint256)",
  topics: [
    ethers.utils.id("Transfer(address,address,uint256)"),
    null,
    ethers.utils.hexZeroPad("0x2796317b0fF8538F253012862c06787Adfb8cEb6", 32),
  ],
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
  txKeys: {
    from: "from",
  },
  isDeposit: true,
  filter: {
    includeToken: ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"], // WETH
  },
};

const ethereumEthWithdrawalParams: ContractEventParams = {
  target: "0x2796317b0fF8538F253012862c06787Adfb8cEb6",
  topic: "TokenWithdraw(address,address,uint256,uint256,bytes32)",
  abi: ["event TokenWithdraw(address indexed to, address token, uint256 amount, uint256 fee, bytes32 indexed kappa)"],
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

const ethereumWithdrawalParams: PartialContractEventParams = constructTransferParams(
  "0x2796317b0fF8538F253012862c06787Adfb8cEb6",
  false,
  { excludeToken: ["0x1B84765dE8B7566e4cEAF4D0fD3c5aF52D3DdE4F"] } // nUSD
);

const constructParams = (chain: Chain) => {
  let eventParams = [] as any;
  if (chain === "ethereum") {
    eventParams.push(
      ethereumDepositParams,
      ethereumEthDepositParams,
      ethereumWithdrawalParams,
      ethereumEthWithdrawalParams
    );
  } else {
    const bridgeZapAddress = contractAddresses[chain].bridgeZap;
    const synapseBridgeAddress = contractAddresses[chain].synapseBridge;
    const nusdAddress = contractAddresses[chain].nusd;
    const depositParams = constructTransferParams(bridgeZapAddress, true, {
      excludeToken: [nusdAddress],
    });
    const withdrawalParams = constructTransferParams(synapseBridgeAddress, false, { excludeToken: [nusdAddress] });
    eventParams.push(depositParams, withdrawalParams);
  }

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("synapse", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  fantom: constructParams("fantom"),
  avalanche: constructParams("avax"),
  bsc: constructParams("bsc"),
  arbitrum: constructParams("arbitrum"),
  optimism: constructParams("optimism"),
  aurora: constructParams("aurora")
};

export default adapter;
