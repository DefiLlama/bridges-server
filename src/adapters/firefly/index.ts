import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { bridgesAddress, processMulticallEvents, SupportedChains } from "./processTransaction";

const depositParams = (chain: SupportedChains) => {
  const bridgeAddress = bridgesAddress[chain];
  const baseConfig = {
    target: bridgeAddress,
    topic: "Deposit()",
    abi: ["event Deposit()"],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    txKeys: {
      from: "from",
    },
    isDeposit: true,
  }
  return [
    {
      ...baseConfig,
      functionSignatureFilter: {
        includeSignatures: ["0x8340f5"],
      },
      inputDataExtraction: {
        inputDataABI: ["function deposit(address token, address target, uint256 amount)"],
        inputDataFnName: "deposit",
        inputDataKeys: {
          token: "token",
          to: "target",
          amount: "amount",
        },
      },
    },
    {
      ...baseConfig,
      functionSignatureFilter: {
        includeSignatures: ["0x376c14"],
      },
    },
  ]
};

const withdrawParams = (chain: SupportedChains) => {
  const bridgeAddress = bridgesAddress[chain];
  const baseConfig = {
    target: bridgeAddress,
    topic: "Withdraw()",
    abi: ["event Withdraw()"],
    isDeposit: false,
    txKeys: {
      from: "from",
    },
  }
  return [
    {
      ...baseConfig,
      functionSignatureFilter: {
        includeSignatures: ["0xd9caed"],
      },
      inputDataExtraction: {
        inputDataABI: ["function withdraw(address token, address target, uint256 amount)"],
        inputDataFnName: "withdraw",
        inputDataKeys: {
          token: "token",
          to: "target",
          amount: "amount",
        },
      },
    },
    {
      target: bridgeAddress,
      topic: "Deposit()",
      abi: ["event Deposit()"],
      isDeposit: false,
      functionSignatureFilter: {
        includeSignatures: ["0xe4e1e1"],
      },
      txKeys: {
        from: "from",
      },
    },
  ]
}

const constructParams = (chain: SupportedChains) => {
  return async (fromBlock: number, toBlock: number) => {
    const eventParams = [
      ...depositParams(chain),
      ...withdrawParams(chain)
    ];
    const logs = await getTxDataFromEVMEventLogs("firefly", chain, fromBlock, toBlock, eventParams);
    return processMulticallEvents(logs, chain);
  };
};

const adapter: BridgeAdapter = {}

for (const chain of Object.keys(bridgesAddress) as SupportedChains[]) {
  adapter[chain] = constructParams(chain);
}

export default adapter;