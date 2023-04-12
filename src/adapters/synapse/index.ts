import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, ContractEventParams, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const nullAddress = "0x0000000000000000000000000000000000000000";

const contractAddresses = {
  ethereum: {
    bridgeZap: "0x6571d6be3d8460CF5F7d6711Cd9961860029D85F",
    synapseBridge: "0x2796317b0fF8538F253012862c06787Adfb8cEb6",
    nusd: "0x1B84765dE8B7566e4cEAF4D0fD3c5aF52D3DdE4F",
  },
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
    neth: "0x19E1ae0eE35c0404f835521146206595d37981ae",
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
    neth: "0x3ea9B0ab55F34Fb188824Ee288CeaEfC63cf908e",
  },
  optimism: {
    bridgeZap: "0x470f9522ff620eE45DF86C58E54E6A645fE3b4A7",
    synapseBridge: "0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b",
    nusd: "0x67C10C397dD0Ba417329543c1a40eb48AAa7cd00",
    neth: "0x809DC529f07651bD43A172e8dB6f4a7a0d771036",
  },
} as {
  [chain: string]: {
    bridgeZap: string;
    synapseBridge: string;
    nusd: string;
    neth?: string;
  };
};

// const tokenDeposit: ContractEventParams = {
//   target: "",
//   topic: "TokenDeposit(address,uint256,address,uint256)",
//   abi: [" event TokenDeposit(address indexed to, uint256 chainId, IERC20 token, uint256 amount)"],
//   argKeys: {
//     to: "to",
//     token: "token",
//     amount: "amount",
//   },
//   isDeposit: true,

// };

// const tokenDepositAndSwap: ContractEventParams = {
//   target: "",
//   topic: "TokenDepositAndSwap(address,uint256,address,uint256,uint8,uint8,uint256,uint256)",
//   abi: [
//     "event TokenDepositAndSwap(address indexed to,uint256 chainId,IERC20 token,uint256 amount,uint8 tokenIndexFrom,uint8 tokenIndexTo,uint256 minDy,uint256 deadline)",
//   ],
//   argKeys: {
//     to: "to",
//     token: "token",
//     amount: "amount",
//   },
//   isDeposit: true,
// };

// const tokenWithdraw: ContractEventParams = {
//   target: "",
//   topic: "TokenWithdraw(address,address,uint256,uint256,bytes32)",
//   abi: ["event TokenWithdraw(address indexed to, IERC20 token, uint256 amount, uint256 fee, bytes32 indexed kappa)"],
//   argKeys: {
//     to: "to",
//     token: "token",
//     amount: "amount",
//   },
//   isDeposit: false,
// };

// const tokenWithdrawAndRemove: ContractEventParams = {
//   target: "",
//   topic: "TokenWithdrawAndRemove(address,address,uint256,uint256,uint8,uint256,uint256,bool,bytes32)",
//   abi: [
//     "event TokenWithdrawAndRemove(address indexed to,IERC20 token,uint256 amount,uint256 fee,uint8 swapTokenIndex,uint256 swapMinAmount,uint256 swapDeadline,bool swapSuccess,bytes32 indexed kappa)",
//   ],
//   argKeys: {
//     to: "to",
//     token: "token",
//     amount: "amount",
//   },
//   isDeposit: false,
// };

const constructParams = (chain: string) => {
  let eventParams = [] as PartialContractEventParams[];
  const addys = contractAddresses[chain];
  let excludeTokens = [addys.nusd];
  if (addys.neth) {
    excludeTokens.push(addys.neth);
  }
  const depositParams = constructTransferParams(addys.bridgeZap, true, {
    excludeToken: excludeTokens,
    excludeFrom: [addys.bridgeZap],
  });
  const withdrawalParams = constructTransferParams(addys.synapseBridge, false, {
    excludeToken: excludeTokens,
    excludeTo: [addys.synapseBridge],
  });
  eventParams.push(depositParams, withdrawalParams);

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("synapse", chain as Chain, fromBlock, toBlock, eventParams);
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
