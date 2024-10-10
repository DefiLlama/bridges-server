import { BigNumber, ethers } from "ethers";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { getProvider } from "@defillama/sdk";

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const SUI_BRIDGE = "0xda3bD1fE1973470312db04551B65f401Bc8a92fD";
const SUI_BRIDGE_CONFIG = "0x72D34Fe82c71Bf8120647518e5128e53106a1540";

const erc20DepositParams: PartialContractEventParams = {
  target: SUI_BRIDGE,
  topic: "TokensDeposited(uint8,uint64,uint8,uint8,uint64,address,bytes)",
  abi: [
    "event TokensDeposited(uint8 indexed sourceChainID, uint64 indexed nonce, uint8 indexed destinationChainID, uint8 tokenID, uint64 suiAdjustedAmount, address senderAddress, bytes recipientAddress)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "senderAddress",
    to: "recipientAddress",
    amount: "suiAdjustedAmount",
    token: "tokenID",
  },
  argGetters: {
    token: (log) => getTokenAddressFromTokenID(log.tokenID),
  },
  fixedEventData: {
    to: SUI_BRIDGE,
  },
  isDeposit: true,
};

const erc20WithdrawParams: PartialContractEventParams = {
  target: SUI_BRIDGE,
  topic: "TokensClaimed(uint8,uint64,uint8,uint8,uint256,bytes,address)",
  abi: [
    "event TokensClaimed(uint8 indexed sourceChainID, uint64 indexed nonce, uint8 indexed destinationChainID, uint8 tokenID, uint256 erc20AdjustedAmount, bytes senderAddress, address recipientAddress)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "senderAddress",
    to: "recipientAddress",
    amount: "erc20AdjustedAmount",
    token: "tokenID"
  },
  argGetters: {
    token: (log) => getTokenAddressFromTokenID(log.tokenID),
  },
  fixedEventData: {
    from: SUI_BRIDGE,
  },
  isDeposit: false,
};

const constructParams = () => {
  const eventParams = [erc20WithdrawParams, erc20DepositParams];
  return async (fromBlock: number, toBlock: number) => {
    const eventLogsRes = await getTxDataFromEVMEventLogs("suibridge", "ethereum", fromBlock, toBlock, eventParams);
    return eventLogsRes.map((event) => {   
      if (event.isDeposit) {
        let erc20TokenAmount = formatSuiAmount(event.amount, event.token);
        event.amount = erc20TokenAmount;
      }
      return event;
    });
  };
};

// TODO: use config contract read to get the token address from tokenID
const getTokenAddressFromTokenID = (tokenID: number) => {
  switch (tokenID) {
    case 2:
      return WETH;
    case 3:
      return WBTC;
    case 4:
      return USDT;
    default:
      return "";
  }
}

// TODO: get decimal values from on chain contract call
const formatSuiAmount = (amount: BigNumber, token: string) => {
  switch (token) {
    case WETH:
      return amount.mul(10**10);
    case WBTC:
      return amount.mul(10**10);
    case USDT:
      return amount.mul(10**12);
    default:
      return amount;
  }
}

const adapter: BridgeAdapter = {
  ethereum: constructParams(),
};

export default adapter;
