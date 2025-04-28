import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";
const contractAddresses: { [token: string]: string } = {
  MOVE: "0xf1df43a3053cd18e477233b59a25fc483c2cbe0f",
  USDC: "0xc209a627a7B0a19F16A963D9f7281667A2d9eFf2",
  USDT: "0x5e87D7e75B272fb7150B4d1a05afb6Bd71474950",
  WETH: "0x06E01cB086fea9C644a2C105A9F20cfC21A526e8",
  WBTC: "0xa55688C280E725704CFe8Ea30eD33fE5B91cE6a4",
};

const constructParams = (chain: string) => {
  const contractAddressesArray = Object.values(contractAddresses);
  const depositEvents = contractAddressesArray.map((contractAddress) => constructTransferParams(contractAddress, true));
  const withdrawEvents = contractAddressesArray.map((contractAddress) =>
    constructTransferParams(contractAddress, false)
  );
  const events = [...depositEvents, ...withdrawEvents];

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("movement", chain as Chain, fromBlock, toBlock, events);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
};

export default adapter;
