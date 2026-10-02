import { Chain } from "@defillama/sdk/build/general";
import { getLogs } from "@defillama/sdk/build/util/logs";
import { ethers } from "ethers";
import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import { incrementGetLogsCount } from "../../utils/cache";
import { getProvider } from "../../utils/provider";
import { EventData } from "../../utils/types";

const BRIDGE = "0x8932fe7726C1EE743F662f485C3e5a5D1D595F71";
const BRIDGE_SENT =
  "event BridgeSent(bytes32 indexed tokenId, address indexed sender, uint32 indexed dstDomain, bytes32 recipient, uint256 amount)";
const iface = new ethers.utils.Interface([BRIDGE_SENT]);

// Token IDs and source-chain addresses from https://app.anubisbridge.com/apiv1/bridge/networks
// (checked 2026-10-02). A zero address denotes that chain's native token.
const tokenIds = {
  DAI: "0xa5e92f3efb6826155f1f728e162af9d7cda33a574a1153b58f03ea01cc37e568",
  USDT: "0x8b1a1d9c2b109e527c9134b25b1a1833b16b6594f92daa9f6d9b7a6024bce9d0",
  USDC: "0xd6aca1be9729c13d677335161321649cccae6a591554772516700f986f942eaa",
  ETH: "0xaaaebeba3810b1e6b70781f14b2d72c1cb89c0b2b320c43bb67ff79f562f5ff4",
  BNB: "0x3ed03c38e59dc60c7b69c2a4bf68f9214acd953252b5a90e8f5f59583e9bc3ae",
  POL: "0x5611acaae5e6f2d151766dae4f93d18a904ae6f9265184ffea692c2e6e52b7fe",
  A: "0x03783fac2efed8fbc9ad443e592ee30e61d65f471140c10ca155e937b435b760",
  sLGNS: "0x72e1c92f962db1ba6ca6185fa3a97457fba2b01901c4edbdbff73619bdae6af9",
  LGNS: "0x1cf326ba9e3dae38fc8d94ea8036a1e5e01be296392125cb64c5aece157c3e74",
} as const;

const ZERO = ethers.constants.AddressZero;
const tokens: Record<string, Record<string, string>> = {
  anubi: {
    [tokenIds.DAI]: "0x83fd06F0846d9D90B3016bF670Efe2E0B11cDe14",
    [tokenIds.USDT]: "0xDfb6a28BC6DC51fed17c27C880F2c66cDd040A3e",
    [tokenIds.USDC]: "0x7DD9c7cBC32dF500Fa3C06fD60Cd62C4E97B2eEF",
    [tokenIds.ETH]: "0xCA326ae4fE47d07e7D20421170DADAcD92eD694C",
    [tokenIds.BNB]: "0x699D13487Ed6b78953da2750887B58Ef738f9636",
    [tokenIds.POL]: "0x72cf15f74657Bb00dd1D8Dd475248dEe644F689A",
    [tokenIds.A]: "0xA921267c56B3a57696d6Fd7949c9FaD0A8E0c177",
    [tokenIds.sLGNS]: "0x1381e2028454fE59AD81FDe5860D87ba4CD9d0f7",
    [tokenIds.LGNS]: "0x5EC79c27323943B420F91D501ac9F627B84A36D9",
  },
  ethereum: {
    [tokenIds.DAI]: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    [tokenIds.USDT]: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    [tokenIds.USDC]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    [tokenIds.ETH]: ZERO,
  },
  polygon: {
    [tokenIds.DAI]: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    [tokenIds.USDT]: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    [tokenIds.USDC]: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    [tokenIds.POL]: ZERO,
    [tokenIds.A]: "0x6631eE651DA438Db2BE611B5A44dFE2Ca04590C5",
    // Currently receive-only on Polygon. Keep the configured addresses so
    // historical BridgeSent events remain decodable if the routes changed.
    [tokenIds.sLGNS]: "0x99a57E6C8558BC6689f894e068733ADf83C19725",
    [tokenIds.LGNS]: "0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01",
  },
  bsc: {
    [tokenIds.DAI]: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    [tokenIds.USDT]: "0x55d398326f99059fF775485246999027B3197955",
    [tokenIds.USDC]: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    [tokenIds.BNB]: ZERO,
  },
};

const domainByChain: Record<string, number> = { anubi: 6714, ethereum: 1, polygon: 137, bsc: 56 };

const getDirectLogs = async (chain: string, fromBlock: number, toBlock: number): Promise<ethers.providers.Log[]> => {
  const provider =
    chain === "bsc"
      ? new ethers.providers.StaticJsonRpcProvider("https://bsc-rpc.publicnode.com", { chainId: 56, name: "bsc" })
      : (getProvider(chain) as ethers.providers.Provider);
  const step = chain === "anubi" ? 50 : chain === "bsc" || chain === "polygon" ? 300 : toBlock - fromBlock + 1;
  const logs: ethers.providers.Log[] = [];
  for (let start = fromBlock; start <= toBlock; start += step) {
    incrementGetLogsCount("anubis-bridge", chain);
    logs.push(
      ...(await provider.getLogs({
        address: BRIDGE,
        topics: [iface.getEventTopic("BridgeSent")],
        fromBlock: start,
        toBlock: Math.min(start + step - 1, toBlock),
      }))
    );
  }
  return logs;
};

const getEvents =
  (chain: keyof typeof tokens) =>
  async (fromBlock: number, toBlock: number): Promise<EventData[]> => {
    // The Ethereum SDK log helper returned an empty result for a confirmed
    // BridgeSent at block 25348295. The Anubis RPC rejects the helper's query
    // beyond the current tip, so query that chain directly in small ranges.
    let logs: ethers.providers.Log[];
    try {
      logs = await getDirectLogs(chain, fromBlock, toBlock);
    } catch (error) {
      if (chain !== "bsc" && chain !== "polygon") throw error;
      // Public BSC RPCs do not serve older archive logs; the SDK indexer can.
      incrementGetLogsCount("anubis-bridge", chain);
      logs = (
        await getLogs({
          target: BRIDGE,
          eventAbi: BRIDGE_SENT,
          fromBlock,
          toBlock,
          chain: chain as Chain,
          entireLog: true,
        })
      ).flat() as ethers.providers.Log[];
    }

    return logs.flatMap((log) => {
      const { tokenId, sender, dstDomain, recipient, amount } = iface.parseLog(log).args;
      const destination = Number(dstDomain);
      // All currently supported routes have Anubis as one endpoint.
      // Do not apply today's token-route list to historical on-chain events.
      if (chain === "anubi" ? ![1, 56, 137].includes(destination) : destination !== domainByChain.anubi) return [];
      const token = tokens[chain][tokenId.toLowerCase()];
      if (!token) {
        throw new Error(`[anubis-bridge] Unknown token ID ${tokenId} on ${chain} in ${log.transactionHash}`);
      }

      return [
        {
          blockNumber: Number(log.blockNumber),
          txHash: log.transactionHash,
          from: sender,
          to: ethers.utils.getAddress(ethers.utils.hexDataSlice(recipient, 12)),
          token,
          amount: ethers.BigNumber.from(amount),
          isDeposit: chain !== "anubi",
        },
      ];
    });
  };

// Source-side BridgeSent alone counts each transfer once; BridgeReceived on the
// destination would double-count it and can also lag behind pending claims.
const adapter: BridgeAdapter = {
  anubis: getEvents("anubi"),
  ethereum: getEvents("ethereum"),
  polygon: getEvents("polygon"),
  bsc: getEvents("bsc"),
};

export default adapter;
