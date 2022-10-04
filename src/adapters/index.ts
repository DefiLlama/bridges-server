import { BridgeAdapter } from "../helpers/bridgeAdapter.type";
import polygon from "./polygon";
import synapse from "./synapse";
import hop from "./hop";
import arbitrum from "./arbitrum"

export default {
  polygon,
  synapse,
  hop,
  arbitrum
} as {
  [bridge: string]: BridgeAdapter;
};
