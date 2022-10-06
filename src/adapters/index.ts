import { BridgeAdapter } from "../helpers/bridgeAdapter.type";
import polygon from "./polygon";
import synapse from "./synapse";
import hop from "./hop";
import arbitrum from "./arbitrum";
import avalanche from "./avalanche";
import optimism from "./optimism";
import multichain from "./multichain";

export default {
  polygon,
  synapse,
  hop,
  arbitrum,
  avalanche,
  optimism,
  multichain
} as {
  [bridge: string]: BridgeAdapter;
};
