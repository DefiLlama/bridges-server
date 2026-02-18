import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { BigNumber } from "ethers";

const NATIVE_TOKEN = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const nullAddress = "0x0000000000000000000000000000000000000000";

// Squid Router addresses
const SQUID_ROUTER_DEFAULT = "0xce16F69375520ab01377ce7B88f5BA8C48F8D666";
const SQUID_ROUTER_FRAXTAL = "0xDC3D8e1Abe590BCa428a8a2FC4CfDbD1AcF57Bd9";
const SQUID_ROUTER_BLAST = "0x492751eC3c57141deb205eC2da8bFcb410738630";

// Coral Spoke addresses (same on all deployed chains)
const CORAL_SPOKE_V1 = "0xfe91aAA1012B47499CfE8758874F2D2c52B22cD8";
const CORAL_SPOKE_OLD = "0xA4cE01bD7Dd91DA968a7C4A8D04282a3f5eA06bB";
const CORAL_SPOKE_V2 = "0xdf4fFDa22270c12d0b5b3788F1669D709476111E";
const ALL_SPOKES = [CORAL_SPOKE_V1, CORAL_SPOKE_OLD, CORAL_SPOKE_V2];

type ChainConfig = {
  router: string;
  spokes?: string[];
};

// Keyed by SDK-compatible chain slug (passed to getLogs)
const chainConfigs: Record<string, ChainConfig> = {
  ethereum: { router: SQUID_ROUTER_DEFAULT, spokes: ALL_SPOKES },
  arbitrum: { router: SQUID_ROUTER_DEFAULT, spokes: ALL_SPOKES },
  avax: { router: SQUID_ROUTER_DEFAULT, spokes: ALL_SPOKES },
  base: { router: SQUID_ROUTER_DEFAULT, spokes: ALL_SPOKES },
  bsc: { router: SQUID_ROUTER_DEFAULT, spokes: ALL_SPOKES },
  blast: { router: SQUID_ROUTER_BLAST, spokes: ALL_SPOKES },
  celo: { router: SQUID_ROUTER_DEFAULT, spokes: ALL_SPOKES },
  optimism: { router: SQUID_ROUTER_DEFAULT, spokes: ALL_SPOKES },
  polygon: { router: SQUID_ROUTER_DEFAULT, spokes: ALL_SPOKES },
  linea: { router: SQUID_ROUTER_DEFAULT, spokes: ALL_SPOKES },
  xdai: { router: SQUID_ROUTER_DEFAULT, spokes: ALL_SPOKES },
  sonic: { router: SQUID_ROUTER_DEFAULT, spokes: ALL_SPOKES },
  soneium: { router: SQUID_ROUTER_DEFAULT, spokes: ALL_SPOKES },
  moonbeam: { router: SQUID_ROUTER_DEFAULT, spokes: ALL_SPOKES },
  berachain: { router: SQUID_ROUTER_DEFAULT, spokes: ALL_SPOKES },
  hyperliquid: { router: SQUID_ROUTER_DEFAULT, spokes: ALL_SPOKES },
  peaq: { router: SQUID_ROUTER_DEFAULT, spokes: ALL_SPOKES },
  fantom: { router: SQUID_ROUTER_DEFAULT },
  filecoin: { router: SQUID_ROUTER_DEFAULT },
  fraxtal: { router: SQUID_ROUTER_FRAXTAL },
  kava: { router: SQUID_ROUTER_DEFAULT },
  mantle: { router: SQUID_ROUTER_DEFAULT },
  scroll: { router: SQUID_ROUTER_DEFAULT },
  imx: { router: SQUID_ROUTER_DEFAULT },
  mantra: { router: SQUID_ROUTER_DEFAULT },
  monad: { router: SQUID_ROUTER_DEFAULT },
  hedera: { router: SQUID_ROUTER_DEFAULT },
  citrea: { router: SQUID_ROUTER_DEFAULT },
};

// Coral Spoke events (same signature across v1, old, and v2 contracts)
const OrderCreatedParams: PartialContractEventParams = {
  target: "",
  topic: "OrderCreated(bytes32,(address,address,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,bytes32))",
  abi: [
    "event OrderCreated(bytes32 indexed orderHash, tuple(address fromAddress, address toAddress, address filler, address fromToken, address toToken, uint256 expiry, uint256 fromAmount, uint256 fillAmount, uint256 feeRate, uint256 fromChain, uint256 toChain, bytes32 postHookHash) order)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "order",
    to: "order",
    token: "order",
    amount: "order",
  },
  isDeposit: true,
};

const OrderFilledParams: PartialContractEventParams = {
  target: "",
  topic: "OrderFilled(bytes32,(address,address,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,bytes32))",
  abi: [
    "event OrderFilled(bytes32 indexed orderHash, tuple(address fromAddress, address toAddress, address filler, address fromToken, address toToken, uint256 expiry, uint256 fromAmount, uint256 fillAmount, uint256 feeRate, uint256 fromChain, uint256 toChain, bytes32 postHookHash) order)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "order",
    to: "order",
    token: "order",
    amount: "order",
  },
  isDeposit: false,
};

const mapNativeToken = (token: string): string => {
  return token.toLowerCase() === NATIVE_TOKEN.toLowerCase() ? nullAddress : token;
};

const constructParams = (chain: string) => {
  const config = chainConfigs[chain];
  if (!config) throw new Error(`[squid] Unknown chain: ${chain}`);

  const { router, spokes } = config;

  return async (fromBlock: number, toBlock: number) => {
    const eventParams: PartialContractEventParams[] = [];

    // Track ERC20 transfers to/from SquidRouter (Axelar GMP, CCTP, Chainflip paths)
    const routerDeposit = constructTransferParams(router, true, {
      excludeFrom: [router, nullAddress],
      excludeTo: [nullAddress],
      includeTo: [router],
    });

    const routerWithdraw = constructTransferParams(router, false, {
      excludeFrom: [nullAddress],
      excludeTo: [nullAddress, router],
      includeFrom: [router],
    });

    eventParams.push(routerDeposit, routerWithdraw);

    // Track Coral Spoke events (OrderCreated/OrderFilled) across all deployed spoke contracts
    if (spokes) {
      for (const spoke of spokes) {
        const orderCreatedEvent = {
          ...OrderCreatedParams,
          target: spoke,
          argGetters: {
            from: (args: any) => args.order.fromAddress,
            to: (args: any) => args.order.toAddress,
            token: (args: any) => mapNativeToken(args.order.fromToken),
            amount: (args: any) => BigNumber.from(args.order.fromAmount),
          },
        };

        const orderFilledEvent = {
          ...OrderFilledParams,
          target: spoke,
          argGetters: {
            from: (args: any) => args.order.fromAddress,
            to: (args: any) => args.order.toAddress,
            token: (args: any) => mapNativeToken(args.order.toToken),
            amount: (args: any) => BigNumber.from(args.order.fillAmount),
          },
        };

        eventParams.push(orderCreatedEvent, orderFilledEvent);
      }
    }

    return await getTxDataFromEVMEventLogs("squidrouter", chain, fromBlock, toBlock, eventParams);
  };
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  arbitrum: constructParams("arbitrum"),
  avalanche: constructParams("avax"),
  base: constructParams("base"),
  bsc: constructParams("bsc"),
  blast: constructParams("blast"),
  celo: constructParams("celo"),
  optimism: constructParams("optimism"),
  polygon: constructParams("polygon"),
  linea: constructParams("linea"),
  gnosis: constructParams("xdai"),
  sonic: constructParams("sonic"),
  soneium: constructParams("soneium"),
  moonbeam: constructParams("moonbeam"),
  berachain: constructParams("berachain"),
  hyperliquid: constructParams("hyperliquid"),
  peaq: constructParams("peaq"),
  fantom: constructParams("fantom"),
  filecoin: constructParams("filecoin"),
  fraxtal: constructParams("fraxtal"),
  kava: constructParams("kava"),
  mantle: constructParams("mantle"),
  scroll: constructParams("scroll"),
  imx: constructParams("imx"),
  mantra: constructParams("mantra"),
  monad: constructParams("monad"),
  hedera: constructParams("hedera"),
  citrea: constructParams("citrea"),
};

export default adapter;
