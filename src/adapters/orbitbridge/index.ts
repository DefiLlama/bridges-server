import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";

/*
Minter functions:
Swap(string fromChain, bytes fromAddr, bytes toAddr, address tokenAddress, bytes32[] bytes32s, uint[] uints, bytes data);
SwapRequest(string toChain, address fromAddr, bytes toAddr, bytes token, address tokenAddress, uint8 decimal, uint amount, uint depositId, bytes data);

Docs: https://bridge-docs.orbitchain.io/

Adapter is finished for chains with a vault: Ethereum, BSC, (also on Klaytn).
Issue is that other chains have minter contracts, and there appears to be multiple (at least on Polygon).
It's difficult to find them all, but can use explorer txs to find them: https://scope.klaytn.com/bridge
(stil not sure I have found them all, some chains do not have much activity)

Polygon has a different contract with no verified version to get events from, getting them
separately: 0x506dc4c6408813948470a06ef6e4a1daf228dbd5

mappings:
***Polygon***
0x0A02D33031917d836Bd7Af02F9f7F6c74d67805F to coingecko:klay-token
0x3D3B92Fe0B4c26b74F8fF13A32dD764F4DFD8b51 to coingecko:klayswap-protocol
0x12c9FFE6538f20A982FD4D17912f0ca00fA82D30 to ethereum:0x662b67d00a13faf93254714dd601f5ed49ef2f51
0x957da9EbbCdC97DC4a8C274dD762EC2aB665E15F to polygon:0xc2132D05D31c914a87C6611C10748AEb04B58e8F
0x5bEF2617eCCA9a39924c09017c5F1E25Efbb3bA8 to polygon:0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
0x7e9928aFe96FefB820b85B4CE6597B8F660Fe4F4 to bsc:0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c
0xE4c2b5db9de5da0A17ED7ec7176602ad99E52624 to polygon:0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619
0x8Ece0a50A025A7E13398212a5BEd2ded11959949 to polygon:0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063

***Fantom***
0x12c9FFE6538f20A982FD4D17912f0ca00fA82D30 to ethereum:0x662b67d00a13faf93254714dd601f5ed49ef2f51
0x0A02D33031917d836Bd7Af02F9f7F6c74d67805F to coingecko:klay-token
0xCc2a9051E904916047c26C90f41c000D4f273456 to ethereum:0x39fBBABf11738317a448031930706cd3e612e1B9
0xE4c2b5db9de5da0A17ED7ec7176602ad99E52624 to ethereum:0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

***Avax***
0x0A02D33031917d836Bd7Af02F9f7F6c74d67805F to coingecko:klay-token
0x6F6a94eb4C6095885f271dc14cA1E4240Cf4dD95 to ethereum:0x6f259637dcd74c767781e37bc6133cd6a68aa161
0xCc2a9051E904916047c26C90f41c000D4f273456 to ethereum:0x39fBBABf11738317a448031930706cd3e612e1B9
0x12c9FFE6538f20A982FD4D17912f0ca00fA82D30 to ethereum:0x662b67d00a13faf93254714dd601f5ed49ef2f51
*/

const contractAddresses = {
  ethereum: {
    vault: "0x1Bf68A9d1EaEe7826b3593C20a0ca93293cb489a",
    nativeToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
  },
  polygon: {
    minters: [
      "0x89c527764f03BCb7dC469707B23b79C1D7Beb780", // various tokens
      "0x6BD8E3beEC87176BA9c705c9507Aa5e6F0E6706f", // ORC, ETH, DAI, and others
      "0x9Abc3F6c11dBd83234D6E6b2c373Dfc1893F648D", // KLAY, and others
      "0xCc2dC439057aDa77aE41CA3d2820a2b37c88FE9C", // ETHPoW
      //"0x2a21eD436E508d8FCF41F99E7fDEB81e80c12d10", // doesn't appear to be used
      "0x58A42330c0984babD5DEc2C943eAA345B7f41e44", // MATIC
      "0xA5f339Eb80F39821d24809AE7680AC6d0653D9Fb", // ethereumfair
    ],
  },
  fantom: {
    minters: [
      "0x9Abc3F6c11dBd83234D6E6b2c373Dfc1893F648D", // KLAY
      "0x38C92A7C2B358e2F2b91723e5c4Fc7aa8b4d279F", // OBT? (no longer used?)
      "0xE38ca00A6FD34B793012Bb9c1471Adc4E98386cF", // XRP
      "0x6BD8E3beEC87176BA9c705c9507Aa5e6F0E6706f", // ORC, ETH
    ],
  },
  avax: {
    minters: [
      "0x9Abc3F6c11dBd83234D6E6b2c373Dfc1893F648D", // KLAY
      "0x38C92A7C2B358e2F2b91723e5c4Fc7aa8b4d279F", // HT
      "0xE38ca00A6FD34B793012Bb9c1471Adc4E98386cF", // XRP
      "0x6BD8E3beEC87176BA9c705c9507Aa5e6F0E6706f", // ORC
    ],
  },
  bsc: {
    vault: "0x89c527764f03BCb7dC469707B23b79C1D7Beb780",
    nativeToken: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
  },
} as {
  [chain: string]: {
    vault?: string;
    minters?: string[];
    nativeToken?: string;
  };
};

// Using this only to filter for native token txs, because it is has some problems for everything else:
// Atomic txs do not emit events, and some token addresses withdrawn are not actual token sent (e.g. DAI).
const nativeDepositParams: PartialContractEventParams = {
  target: "",
  topic: "Deposit(string,address,bytes,address,uint8,uint256,uint256,bytes)",
  abi: [
    "event Deposit(string toChain, address fromAddr, bytes toAddr, address token, uint8 decimal, uint256 amount, uint256 depositId, bytes data)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "fromAddr",
    token: "token",
    amount: "amount",
  },
  fixedEventData: {
    to: "",
  },
  isDeposit: true,
  mapTokens: {
    "0x0000000000000000000000000000000000000000": "",
  },
  filter: {
    includeToken: [""],
  },
};

const nativeWithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "Withdraw(string,bytes,bytes,bytes,bytes32[],uint256[],bytes)",
  abi: [
    "event Withdraw(string fromChain, bytes fromAddr, bytes toAddr, bytes token, bytes32[] bytes32s, uint256[] uints, bytes data)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "token",
    amount: "uints",
    to: "toAddr",
  },
  selectIndexesFromArrays: {
    amount: "0",
  },
  fixedEventData: {
    from: "",
  },
  mapTokens: {
    "0x0000000000000000000000000000000000000000": "",
  },
  filter: {
    includeToken: [""],
  },
  isDeposit: false,
};

const minterDepositParams: PartialContractEventParams = {
  target: "",
  topic: "SwapRequest(string,address,bytes,bytes,address,uint8,uint,uint,bytes)",
  abi: [
    "event SwapRequest(string toChain, address fromAddr, bytes toAddr, bytes token, address tokenAddress, uint8 decimal, uint amount, uint depositId, bytes data)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "tokenAddress",
    from: "fromAddr",
    amount: "uints",
  },
  selectIndexesFromArrays: {
    amount: "0",
  },
  fixedEventData: {
    to: "",
  },
  isDeposit: true,
};

const minterWithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "Swap(string,bytes,bytes,address,bytes32[],uint256[],bytes)",
  abi: [
    "event Swap(string fromChain, bytes fromAddr, bytes toAddr, address tokenAddress, bytes32[] bytes32s, uint256[] uints, bytes data)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "tokenAddress",
    to: "toAddr",
    amount: "uints",
  },
  selectIndexesFromArrays: {
    amount: "0",
  },
  fixedEventData: {
    from: "",
  },
  isDeposit: false,
};

const constructParams = (chain: string) => {
  let eventParams = [] as any;
  const vaultAddress = contractAddresses[chain].vault;
  const nativeToken = contractAddresses[chain].nativeToken;
  const minters = contractAddresses[chain].minters;

  if (vaultAddress) {
    const finalNativeDepositParams = {
      ...nativeDepositParams,
      target: vaultAddress,
      fixedEventData: {
        to: vaultAddress,
      },
      mapTokens: {
        "0x0000000000000000000000000000000000000000": nativeToken,
      },
      filter: {
        includeToken: [nativeToken],
      },
    };
    const finalNativeWithdrawalParams = {
      ...nativeWithdrawalParams,
      target: vaultAddress,
      fixedEventData: {
        from: vaultAddress,
      },
      mapTokens: {
        "0x0000000000000000000000000000000000000000": nativeToken,
      },
      filter: {
        includeToken: [nativeToken],
      },
    };
    const ercDepositParams = constructTransferParams(vaultAddress, true);
    const ercWithdrawalParams = constructTransferParams(vaultAddress, false);
    eventParams.push(finalNativeDepositParams, finalNativeWithdrawalParams, ercDepositParams, ercWithdrawalParams);
  } else {
    minters?.map((minterAddress) => {
      const finalMinterWithdrawalParams = {
        ...minterWithdrawalParams,
        target: minterAddress,
        fixedEventData: {
          from: minterAddress,
        },
      };
      const finalMinterDepositParams = {
        ...minterDepositParams,
        target: minterAddress,
        fixedEventData: {
          to: minterAddress,
        },
      };
      eventParams.push(finalMinterDepositParams, finalMinterWithdrawalParams);
    });
  }

  if (chain === "polygon") {
    const meshDepositParams = constructTransferParams("0x506dc4c6408813948470a06ef6e4a1daf228dbd5", true, undefined, [
      "0x0ac096",
    ]);
    const meshWithdrawalParams = constructTransferParams(
      "0x506dc4c6408813948470a06ef6e4a1daf228dbd5",
      false,
      undefined,
      ["0x2ac5ab"]
    );
    eventParams.push(meshDepositParams, meshWithdrawalParams);
  }

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("orbitbridge", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  fantom: constructParams("fantom"),
  avalanche: constructParams("avax"),
  bsc: constructParams("bsc"),
};

export default adapter;
