import { BridgeAdapter } from "../helpers/bridgeAdapter.type";
import polygon from "./polygon";
import synapse from "./synapse";
import hop from "./hop";
import arbitrum from "./arbitrum";
import avalanche from "./avalanche";
import fantom from "./fantom";
import optimism from "./optimism"

export default {
  polygon,
  synapse,
  hop,
  arbitrum,
  avalanche,
  fantom,
  optimism
} as {
  [bridge: string]: BridgeAdapter;
};
