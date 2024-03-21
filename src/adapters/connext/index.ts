import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

/*
Contracts: https://docs.connext.network/resources/deployments
*/

const contracts = {
  ethereum: { ConnextDiamond: "0x8898B472C54c31894e3B9bb83cEA802a5d0e63C6" },
  optimism: { ConnextDiamond: "0x8f7492DE823025b4CfaAB1D34c58963F2af5DEDA" },
  polygon: { ConnextDiamond: "0x11984dc4465481512eb5b777E44061C158CF2259" },
  arbitrum: { ConnextDiamond: "0xEE9deC2712cCE65174B561151701Bf54b99C24C8" },
  bsc: { ConnextDiamond: "0xCd401c10afa37d641d2F594852DA94C700e4F2CE" },
  xdai: { ConnextDiamond: "0x5bB83e95f63217CDa6aE3D181BA580Ef377D2109" },
  linea: { ConnextDiamond: "0xa05eF29e9aC8C75c530c2795Fa6A800e188dE0a9" },
  base: { ConnextDiamond: "0xB8448C6f7f7887D36DcA487370778e419e9ebE3F" },
  metis: { ConnextDiamond: "0x6B142227A277CE62808E0Df93202483547Ec0188" },
  mode: { ConnextDiamond: "0x7380511493DD4c2f1dD75E9CCe5bD52C787D4B51" }
} as const;
type SupportedChains = keyof typeof contracts;

const xcallParams: PartialContractEventParams = {
  target: "",
  topic: "XCalled(bytes32,uint256,bytes32,(uint32,uint32,uint32,address,address,bool,bytes,uint256,address,uint256,uint256,uint256,bytes32),address,uint256,address,bytes)",
  abi: [
    "event XCalled(bytes32 indexed transferId, uint256 indexed nonce, bytes32 indexed messageHash, (uint32 originDomain, uint32 destinationDomain, uint32 canonicalDomain, address to, address delegate, bool receiveLocal, bytes callData, uint256 slippage, address originSender, uint256 bridgedAmt, uint256 normalizedIn, uint256 nonce, bytes32 canonicalId) params, address asset, uint256 amount, address local, bytes messageBody)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "amount",
    token: "asset",
    to: "to",
    from: "originSender",
  },
  isDeposit: true,
};

const executeParams: PartialContractEventParams = {
  target: "",
  topic: "Executed(bytes32,address,address,((uint32,uint32,uint32,address,address,bool,bytes,uint256,address,uint256,uint256,uint256,bytes32),address[],bytes[],address,bytes),address,uint256,address)",
  abi: [
    "event Executed(bytes32 indexed transferId, address indexed to, address indexed asset, ((uint32 originDomain, uint32 destinationDomain, uint32 canonicalDomain, address to, address delegate, bool receiveLocal, bytes callData, uint256 slippage, address originSender, uint256 bridgedAmt, uint256 normalizedIn, uint256 nonce, bytes32 canonicalId) params, address[] routers, bytes[] routerSignatures, address sequencer, bytes sequencerSignature) args, address local, uint256 amount, address caller)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    amount: "amount",
    token: "asset",
    to: "to",
    from: "originSender",
  },
  isDeposit: false,
};

const constructParams = (chain: Chain) => {

  const chainConfig = contracts[chain as SupportedChains];

  const eventParams: PartialContractEventParams[] = [
    { ...xcallParams, target: chainConfig.ConnextDiamond },
    { ...executeParams, target: chainConfig.ConnextDiamond }
  ];

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("connext", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  optimism: constructParams("optimism"),
  polygon: constructParams("polygon"),
  arbitrum: constructParams("arbitrum"),
  bsc: constructParams("bsc"),
  xdai: constructParams("xdai"),
  linea: constructParams("linea"),
  base: constructParams("base"),
  metis: constructParams("metis"),
  mode: constructParams("mode")
};

export default adapter;