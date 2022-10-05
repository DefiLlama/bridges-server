import { BridgeAdapter } from "../helpers/bridgeAdapter.type";
import polygon from "./polygon";
import synapse from "./synapse";
import hop from "./hop";
import arbitrum from "./arbitrum"
import avalanche from "./avalanche"

export default {
  polygon,
  synapse,
  hop,
  arbitrum,
  avalanche
} as {
  [bridge: string]: BridgeAdapter;
};
