import { ContractEventParamsV2, } from "../../helpers/bridgeAdapter.type";
import { processEVMLogsExport } from "../../helpers/processTransactions";

const bridgeAddresses = {
  ethereum: "0xBBbD1BbB4f9b936C3604906D7592A644071dE884",
  avax: "0xBBbD1BbB4f9b936C3604906D7592A644071dE884",
  bsc: "0xBBbD1BbB4f9b936C3604906D7592A644071dE884",
  fantom: "0xBBbD1BbB4f9b936C3604906D7592A644071dE884",
  polygon: "0xBBbD1BbB4f9b936C3604906D7592A644071dE884",
} as { [chain: string]: string };

const adapter = {} as any

Object.entries(bridgeAddresses).forEach(([chain, bridgeAddress]) => {
  const withdrawParams: ContractEventParamsV2 = {
    target: bridgeAddress,
    abi: "event Received(address indexed to, address token, uint256 amount, uint128 indexed lockId, bytes4 source)",
    fixedEventData: {
      from: bridgeAddress,
    },
    isDeposit: false,
  };
  const depositParams: ContractEventParamsV2 = {
    target: bridgeAddress,
    abi: "event Sent (bytes4 tokenSource, bytes32 tokenSourceAddress, address from, bytes32 indexed recipient, uint256 amount, uint128 indexed lockId, bytes4 destination)",
    fixedEventData: {
      to: bridgeAddress,
    },
    isDeposit: true,
    transformLog: (log: any) => {
      log.token = '0x'+log.args.tokenSourceAddress.slice(0, 40)
      return log;
    }
  };

  adapter[chain] = processEVMLogsExport([withdrawParams, depositParams]);
})


export default adapter;
