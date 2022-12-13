import { BridgeAdapter } from "../../helpers/bridgeAdapter.type";
import { getIbcVolumeByZoneName } from "../../helpers/mapofzones";

const chainsMapping = {
  osmosis: "osmosis-1",
  secret: "secret-4",
  injective: "injective-1",
  terra: "columbus-5",
  crescent: "crescent-1",
  cronos: "cronosmainnet_25-1",
  evmos: "evmos_9001-2",
  juno: "juno-1",
  kujira: "kaiyo-1",
  sifchain: "sifchain-1",
  stride: "stride-1",
  cosmos: "cosmoshub-4",
  canto: "canto_7700-1",
  // these ones I'm not sure about separating into own bridges
  /*
  axelar: "axelar-dojo-1",
  gravity_bridge: "gravity-bridge-3",
  */
  // these ones I'm not sure about including (i.e., if they have any defi that makes them relevant)
  // there are also about 25 more with almost no volume I did not include here
  /*
  bostrom: "bostrom",
  crypto_org: "crypto-org-chain-mainnet-1",
  agoric: "agoric-3",
  akash: "akashnet-2",
  comdex: "comdex-1",
  fetch_ai: "fetchhub-4",
  asset_mantle: "mantle-1",
  sentinel: "sentinelhub-2",
  stargaze: "stargaze-1",
  umee: "umee-1",
  medibloc: "panacea-3",
  band: ""
  */
} as { [chain: string]: string };

const chainExports = () => {
  const chainBreakdown = {} as BridgeAdapter;
  Object.entries(chainsMapping).map(([chainName, zoneName]) => {
    chainBreakdown[chainName] = getIbcVolumeByZoneName(chainName, zoneName);
  });
  return chainBreakdown;
};

const adapter: BridgeAdapter = chainExports();

export default adapter;
