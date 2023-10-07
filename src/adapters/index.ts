import { BridgeAdapter } from "../helpers/bridgeAdapter.type";
import polygon from "./polygon";
import synapse from "./synapse";
import hop from "./hop";
import arbitrum from "./arbitrum";
import avalanche from "./avalanche";
import optimism from "./optimism";
import multichain from "./multichain";
import celer from "./celer";
import polynetwork from "./polynetwork";
import orbitbridge from "./orbitbridge";
import chainport from "./chainport";
import stargate from "./stargate";
import portal from "./portal";
import binancepeg from "./binancepeg";
import xdai from "./xdai";
import avalanchebtc from "./avalanche-btc";
import axelar from "./axelar";
import rainbowbridge from "./rainbowbridge";
import across from "./across";
import debridge from "./debridge";
import optics from "./optics";
import allbridge from "./allbridge";
import ibc from "./ibc";
import meter from "./meter";
// import tronpeg from "./tronpeg"
import wanbridge from './wanbridge';
import beamer from "./beamer";
import zksync from "./zksync";
import polygon_zkevm from "./polygon_zkevm";
import symbiosis from "./symbiosis";
import meson from "./meson";
import base from "./base";
import mantle from "./mantle";
import neuron from "./neuron";
import axelarsatellite from "./axelar-satellite";
import manta from "./manta";
import squidrouter from "./squid";
import eywa from "./eywa";
import rhinofi from './rhinofi';

export default {
  polygon,
  synapse,
  hop,
  arbitrum,
  avalanche,
  optimism,
  multichain,
  celer,
  polynetwork,
  orbitbridge,
  chainport,
  stargate,
  portal,
  binancepeg,
  xdai,
  "avalanche-btc": avalanchebtc,
  axelar,
  rainbowbridge,
  across,
  debridge,
  optics,
  allbridge,
  ibc,
  meter,
  wanbridge,
  beamer,
  zksync,
  polygon_zkevm,
  symbiosis,
  meson,
  base,
  mantle,
  neuron,
  axelarsatellite,
  squidrouter,
  manta,
  eywa,
  rhinofi,
} as {
  [bridge: string]: BridgeAdapter;
};
