import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

/*
 * Alcor Bridge: lock/mint between EVM chains and Antelope (Telos is the hub, WAX a spoke).
 * Every asset is locked in one AlcorVault per EVM chain; Telos light clients prove the deposits
 * and the vault pays withdrawals out once Telos is proved back to it.
 * Docs: https://telos.alcor.exchange/api/bridge/docs/bot
 *
 * Deposit: ERC-20 or native coin (token = address(0)) locked in the vault.
 * Released: withdrawal paid out of the vault; `fee` is part of the same withdrawal,
 * paid to whoever delivered the proof, so both leave the vault.
 */

const vaults = {
  ethereum: "0x3e447d533321ad6a8412f97034ac295a9ff8d858",
  bsc: "0x53F18eaa8Bf8099b5bA21Bb7E11ed311b677690e",
  polygon: "0x15bbd21148f98c4daeb30450eb05666f7859993d",
} as { [chain: string]: string };

const depositParams = (vault: string): PartialContractEventParams => ({
  target: vault,
  topic: "Deposit(address,address,uint256,uint64,uint64,uint64,address,uint64,uint64,bytes)",
  abi: [
    "event Deposit(address indexed token, address indexed from, uint256 amount, uint64 canonical, uint64 telosTo, uint64 nonce, address refundTo, uint64 fillFee, uint64 filler, bytes memo)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "token",
    from: "from",
    amount: "amount",
  },
  fixedEventData: {
    to: vault,
  },
  isDeposit: true,
});

const withdrawalParams = (vault: string): PartialContractEventParams => ({
  target: vault,
  topic: "Released(uint64,address,address,uint256,address,uint256)",
  abi: [
    "event Released(uint64 indexed id, address indexed token, address indexed to, uint256 amount, address feeTo, uint256 fee)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "token",
    to: "to",
    amount: "amount",
  },
  argGetters: {
    amount: (args: any) => args.amount.add(args.fee),
  },
  fixedEventData: {
    from: vault,
  },
  isDeposit: false,
});

const constructParams = (chain: string) => {
  const vault = vaults[chain];
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("alcor", chain as Chain, fromBlock, toBlock, [
      depositParams(vault),
      withdrawalParams(vault),
    ]);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  bsc: constructParams("bsc"),
  polygon: constructParams("polygon"),
};

export default adapter;
