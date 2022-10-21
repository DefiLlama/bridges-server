import { Chain } from "@defillama/sdk/build/general";
import {
  BridgeAdapter,
  ContractEventParams,
  PartialContractEventParams,
} from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

/*
***Ethereum***
For all:
-deposits via Send to L2
-withdrawals via Bond Withdrawal

0xb8901acB165ed027E32754E0FFe830802919727f Hop Ethereum Bridge
0x3d4Cc8A61c7528Fd86C55cfe061a78dCBA48EDd1 Hop DAI Bridge
*/

const contracts = {
  ethereum: {
    ETH: "0xb8901acB165ed027E32754E0FFe830802919727f",
    DAI: "0x3d4Cc8A61c7528Fd86C55cfe061a78dCBA48EDd1",
  },
} as any;

const tokens = {
  ethereum: {
    ETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  },
} as any;

const bridgeableTokens = {
  ethereum: ["ETH", "DAI"],
} as any;

const depositParams: PartialContractEventParams = {
  target: "",
  topic:
    "TransferSentToL2(uint256,address,uint256,uint256,uint256,address,uint256)",
  abi: [
    "event TransferSentToL2(uint256 indexed chainId, address indexed recipient, uint256 amount, uint256 amountOutMin, uint256 deadline, address indexed relayer, uint256 relayerFee)",
  ],
  argKeys: {
    amount: "amount",
    from: "recipient",
  },
  isDeposit: true,
};

const withdrawalParams: ContractEventParams = {
  target: "",
  topic: "WithdrawalBonded(bytes32,uint256)",
  abi: ["event WithdrawalBonded(bytes32 indexed transferId, uint256 amount)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
    from: "address",
  },
  isDeposit: false,
  inputDataExtraction: {
    inputDataABI: [
      "function bondWithdrawal(address recipient, uint256 amount, bytes32 transferNonce, uint256 bonderFee)",
    ],
    inputDataFnName: "bondWithdrawal",
    inputDataKeys: {
      to: "recipient",
      amount: "amount",
    },
  },
};

const constructParams = (chain: Chain) => {
  let eventParams = [] as any;
  bridgeableTokens[chain].map((token: string) => {
    const finalDepositParams = {
      ...depositParams,
      target: contracts[chain][token],
      contractChain: chain,
      fixedEventData: {
        token: tokens[chain][token],
      },
    };
    const finalWithdrawalParams = {
      ...withdrawalParams,
      target: contracts[chain][token],
      contractChain: chain,
      fixedEventData: {
        token: tokens[chain][token],
      },
    };
    eventParams.push(finalDepositParams, finalWithdrawalParams);
  });
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("hop", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
};

export default adapter;
