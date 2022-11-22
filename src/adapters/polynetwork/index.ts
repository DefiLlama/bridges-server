import { BridgeAdapter, ContractEventParams, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

/* 
Contract addresses are here: https://github.com/polynetwork/docs/blob/master/config/README.md

***NEED TO MANUALLY MAP ALL THE WRAPPED TOKENS***

Events for all withdrawals/deposits are emitted by CCM. 
Some xfers are routed to "Lock Proxy", some to some to "Bridge-O3V2", and some to "PLT NFT Lock Proxy".
On Ethereum, there is also an undocumented "Switcheo" related contract that receives routing from CCM.

Event logs are obtained separately from the 2 different contracts, PLT NFT Lock Proxy is ignored.
*/

const contractAddresses = {
  ethereum: {
    lockProxy: "0x250e76987d838a75310c34bf422ea9f1AC4Cc906",
    o3v2: "0xF7a9FE22149aD2a077eb40a90f316a8A47525EC3",
    switcheoLp: "0x9a016Ce184a22DbF6c17daA59Eb7d3140DBd1c54", // not sure what this is, but it does swaps and is routed to by CCM
    nativeToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
  },
  polygon: {
    lockProxy: "0x28FF66a1B95d7CAcf8eDED2e658f768F44841212",
    o3v2: "0x5F8517D606580D30c3bf210Fa016B8916c685be8",
    nativeToken: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
  },
  fantom: {
    lockProxy: "0xd3b90E2603D265Bf46dBC788059AC12D52B6AC57",
    o3v2: "0x7BB9709Ec786Ea549eE67AE02E8B0c75DDE77f48",
    nativeToken: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", // WFTM
  },
  avax: {
    lockProxy: "0xd3b90E2603D265Bf46dBC788059AC12D52B6AC57",
    o3v2: "0x8a05dC902D15Aea923F2C722292F5561c3496317",
    nativeToken: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", // WAVAX
  },
  bsc: {
    lockProxy: "0x2f7ac9436ba4B548f9582af91CA1Ef02cd2F1f03",
    o3v2: "0x12682669700109AE1F3B326D74f2A5bDB63549E3",
    nativeToken: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
  },
  arbitrum: {
    lockProxy: "0x2f7ac9436ba4B548f9582af91CA1Ef02cd2F1f03",
    o3v2: "0x30E39786F0dd700DA277a54BD9c07F7894cB5aBa",
    nativeToken: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH
  },
  optimism: {
    lockProxy: "0xd3b90E2603D265Bf46dBC788059AC12D52B6AC57",
    o3v2: "0x8a05dC902D15Aea923F2C722292F5561c3496317",
    nativeToken: "0x4200000000000000000000000000000000000006", // WETH
  },
  xdai: {
    lockProxy: "0x77F3A156e8E597C64d4a12d62f20a0d2ff839dD5",
    o3v2: "0x3A5292101A26c1dC75f97965B9091D4761A5d1E3",
    nativeToken: "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d", // WDAI
  },
  celo: {
    lockProxy: "0x526444013Cd4D457212fF88Fe6F8e7c995DF1E40",
    nativeToken: "0x471EcE3750Da237f93B8E339c536989b8978a438", // CELO
  },
} as {
  [chain: string]: {
    lockProxy: string;
    o3v2?: string;
    switcheoLp?: string;
    nativeToken: string;
  };
};

/*
Not needed, but can be used for diagnosing missed txs.

const ccmDepositParams: PartialContractEventParams = {
  target: "",
  topic: "VerifyHeaderAndExecuteTxEvent(uint64,bytes,bytes,bytes)",
  abi: [
    "event VerifyHeaderAndExecuteTxEvent(uint64 fromChainID, bytes toContract, bytes crossChainTxHash, bytes fromChainTxHash)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "toContract", // this is not the token, there are a few different types of deposits so I get the contract hash here for further processing and get the token later
  },
  txKeys: {
    from: "from",
  },
  fixedEventData: {
    to: "",
  },
  isDeposit: true,
};

const ccmWithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "CrossChainEvent(address,bytes,address,uint64,bytes,bytes)",
  abi: [
    "event CrossChainEvent(address indexed sender, bytes txId, address proxyOrAssetContract, uint64 toChainId, bytes toContract, bytes rawdata)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "proxyOrAssetContract", // again, is not the token
  },
  txKeys: {
    to: "to",
  },
  fixedEventData: {
    from: "",
  },
  isDeposit: false,
};
*/

const ercDepositParams: PartialContractEventParams = {
  target: "",
  topic: "LockEvent(address,address,uint64,bytes,bytes,uint256)",
  abi: [
    "event LockEvent(address fromAssetHash, address fromAddress, uint64 toChainId, bytes toAssetHash, bytes toAddress, uint256 amount)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "fromAssetHash",
    amount: "amount",
  },
  txKeys: {
    from: "from", // depositor is here, argKey only gives the Poly Wrapper address
  },
  fixedEventData: {
    to: "",
  },
  isDeposit: true,
  mapTokens: {
    "0x0000000000000000000000000000000000000000": "",
  },
};

const ercWithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "UnlockEvent(address,address,uint256)",
  abi: ["event UnlockEvent(address toAssetHash, address toAddress, uint256 amount)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "toAssetHash",
    amount: "amount",
    to: "toAddress",
  },
  fixedEventData: {
    from: "",
  },
  mapTokens: {
    "0x0000000000000000000000000000000000000000": "",
  },
  isDeposit: false,
};

const switcheoDepositParams: PartialContractEventParams = {
  target: "",
  topic: "LockEvent(address,address,uint64,bytes,bytes,bytes)",
  abi: [
    "event LockEvent(address fromAssetHash, address fromAddress, uint64 toChainId, bytes toAssetHash, bytes toAddress, bytes txArgs)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  txKeys: {
    from: "from", // depositor is here, argKey only gives the Poly Wrapper address
  },
  fixedEventData: {
    to: "",
  },
  getTokenFromReceipt: {
    token: true,
    amount: true,
    native: "",
  },
  isDeposit: true,
  mapTokens: {
    "0x0000000000000000000000000000000000000000": "",
  },
};

const switcheoWithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "UnlockEvent(address,address,uint256,bytes)",
  abi: ["event UnlockEvent(address toAssetHash, address toAddress, uint256 amount, bytes txArgs)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "toAssetHash",
    amount: "amount",
    to: "toAddress",
  },
  fixedEventData: {
    from: "",
  },
  mapTokens: {
    "0x0000000000000000000000000000000000000000": "",
  },
  isDeposit: false,
};

/*
const processEventLogs = async (logs: EventData[], chain: string) => {
  const lockProxyAddress = contractAddresses[chain].lockProxy;
  const o3v2Address = contractAddresses[chain].o3v2;
  const switcheoLpAddress = contractAddresses[chain].switcheoLp;
  const filteredLogs = logs
    .map((log) => {
      const proxyOrAssetContract = log.token;
      // if contract is Lock Proxy, can ignore because event is present in lockProxyEventLogs
      // if contract is
      if (
        proxyOrAssetContract.toLowerCase() === lockProxyAddress.toLowerCase() ||
        proxyOrAssetContract.toLowerCase() === o3v2Address?.toLowerCase() ||
        proxyOrAssetContract.toLowerCase() === switcheoLpAddress?.toLowerCase()
      ) {
        return null;
      }
      console.log(proxyOrAssetContract);
      console.log(log.isDeposit);
      console.log(log.txHash);
      return log;
    })
    .filter((log) => log) as EventData[];
  return filteredLogs;
};
*/

const constructParams = (chain: string) => {
  let eventParams = [] as any;
  const {
    lockProxy: lockProxyAddress,
    o3v2: o3v2Address,
    switcheoLp: switcheoLpAddress,
    nativeToken,
  } = contractAddresses[chain];

  /*
  let ccmEventParams = [] as any;
  const finalCcmDepositParams = {
    ...ccmDepositParams,
    target: ccmAddress,
    fixedEventData: {
      to: ccmAddress,
    },
  };
  const finalCcmWithdrawalParams = {
    ...ccmWithdrawalParams,
    target: ccmAddress,
    fixedEventData: {
      from: ccmAddress,
    },
  };
  ccmEventParams.push(finalCcmDepositParams, finalCcmWithdrawalParams);
  */

  const finalErcDepositParams = {
    ...ercDepositParams,
    target: lockProxyAddress,
    fixedEventData: {
      to: lockProxyAddress,
    },
    mapTokens: {
      "0x0000000000000000000000000000000000000000": nativeToken,
    },
  };
  const finalErcWithdrawalParams = {
    ...ercWithdrawalParams,
    target: lockProxyAddress,
    fixedEventData: {
      from: lockProxyAddress,
    },
    mapTokens: {
      "0x0000000000000000000000000000000000000000": nativeToken,
    },
  };
  eventParams.push(finalErcDepositParams, finalErcWithdrawalParams);

  if (o3v2Address) {
    const finalO3v2DepositParams = {
      ...ercDepositParams,
      target: o3v2Address,
      fixedEventData: {
        to: o3v2Address,
      },
      mapTokens: {
        "0x0000000000000000000000000000000000000000": nativeToken,
      },
    };
    const finalO3v2WithdrawalParams = {
      ...ercWithdrawalParams,
      target: o3v2Address,
      fixedEventData: {
        from: o3v2Address,
      },
      mapTokens: {
        "0x0000000000000000000000000000000000000000": nativeToken,
      },
    };
    eventParams.push(finalO3v2DepositParams, finalO3v2WithdrawalParams);
  }

  if (switcheoLpAddress) {
    const finalSwitcheoLpDepositParams = {
      ...switcheoDepositParams,
      target: switcheoLpAddress,
      fixedEventData: {
        to: switcheoLpAddress,
      },
      mapTokens: {
        "0x0000000000000000000000000000000000000000": nativeToken,
      },
      getTokenFromReceipt: {
        token: true,
        amount: true,
        native: nativeToken,
      },
    };
    const finalSwitcheoLpWithdrawalParams = {
      ...switcheoWithdrawalParams,
      target: switcheoLpAddress,
      fixedEventData: {
        from: switcheoLpAddress,
      },
      mapTokens: {
        "0x0000000000000000000000000000000000000000": nativeToken,
      },
    };
    eventParams.push(finalSwitcheoLpDepositParams, finalSwitcheoLpWithdrawalParams);
  }

  return async (fromBlock: number, toBlock: number) => {
    const eventLogs = await getTxDataFromEVMEventLogs("polynetwork", chain as Chain, fromBlock, toBlock, eventParams);
    /*
    const ccmEventLogs = await getTxDataFromEVMEventLogs(
      "polynetwork",
      chain as Chain,
      fromBlock,
      toBlock,
      ccmEventParams
    );
    const processedCcmEventLogs = await processEventLogs(ccmEventLogs, chain);
    */

    return eventLogs;
  };
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  fantom: constructParams("fantom"),
  avalanche: constructParams("avax"),
  arbitrum: constructParams("arbitrum"),
  optimism: constructParams("optimism"),
  gnosis: constructParams("xdai"),
  celo: constructParams("celo"),
  bsc: constructParams("bsc"),
};

export default adapter;
