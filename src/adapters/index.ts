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
import debridgedln from "./debridgedln";
import optics from "./optics";
import allbridgecore from "./allbridge-core";
import allbridgeclassic from "./allbridge-classic";
import ibc from "./ibc";
import meter from "./meter";
// import tronpeg from "./tronpeg"
import wanbridge from "./wanbridge";
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
import rhinofi from "./rhinofi";
import pepeteam_bridge from "./pepeteam-bridge";
import pnetwork from "./pnetwork";
import interport from "./interport-finance";
import shimmerbridge from "./shimmerbridge";
import butternetwork from "./butternetwork";
import xy from "./xy-finance";
import circle from "./circle";
import garden from "./garden";
import rootstock from "./rootstock";
import mode from "./mode";
import router from "./router";
import tokenbridge from "./rootstock-token-bridge";
import butterswap from "./butterswap";
import mesprotocol from "./mesprotocol";
import fuse from "./fuse";
import orbiter from "./orbiter";
import connext from "./connext";
import xswap from "./xswap";
import owlto from "./owlto";
import zkbridge from "./zkbridge";
import helixbridge from "./helixbridge";
import oooo from "./oooo";
import memebridge from "./memebridge";
import bunnyfi from "./bunnyfi";
import minibridge from "./minibridge";
import cometbridge from "./cometbridge";
import fastbtc from "./rootstock-fastbtc-bridge";
import crowdswap from "./crowdswap";
import mint from "./mint";
import suibridge from "./suibridge";

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
  oooo,
  "avalanche-c": avalanchebtc,
  axelar,
  rainbowbridge,
  across,
  debridgedln,
  optics,
  "allbridge-core": allbridgecore,
  allbridge: allbridgeclassic,
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
  pepeteam_bridge,
  pnetwork,
  interport,
  shimmerbridge,
  butternetwork,
  xy,
  garden,
  rootstock,
  mode,
  circle,
  router,
  tokenbridge,
  butterswap,
  mesprotocol,
  fuse,
  orbiter,
  connext,
  xswap,
  owlto,
  zkbridge,
  zkbridge111: zkbridge,
  helixbridge,
  memebridge,
  bunnyfi,
  minibridge,
  cometbridge,
  fastbtc,
  crowdswap,
  mint,
  suibridge,
} as {
  [bridge: string]: BridgeAdapter;
};
