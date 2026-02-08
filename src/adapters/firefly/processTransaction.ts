import { ethers } from "ethers";
import { PromisePool } from "@supercharge/promise-pool";
import { getProvider } from "../../utils/provider";
import { EventData } from "../../utils/types";

export const bridgesAddress = {
  ethereum: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  optimism: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  cronos: "0x3c167F5B05FA97d11601F6e187B0d100A95595Ba",
  xdc: "0x0061f8549e337be2a47d938f6fb3289be89bae97",
  bsc: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  gnosis: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  unichain: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  polygon: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  monad: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  sonic: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  manta: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  hsk: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  "x layer": "0x5eec3660830fc0aa8053d6048d11276fcf29402f",
  opbnb: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  "zksync era": "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  "world chain": "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  stable: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  hyperevm: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  conflux: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  sei: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  gravity: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  soneium: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  ronin: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  abstract: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  mantle: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  klaytn: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  base: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  plasma: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  arbitrum: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  "arbitrum nova": "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  celo: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  avalanche: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  ink: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  linea: "0x3c167F5B05FA97d11601F6e187B0d100A95595Ba",
  berachain: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  codex: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
  blast: "0xcbCD511CcF92Da77245C4aE936e574B630FF0001",
} as const;

export type SupportedChains = keyof typeof bridgesAddress;

const CALL3VALUE_STRUCT = "tuple(address target, bool allowFailure, uint256 value, bytes callData)[]";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const depositAndMulticallInterface = new ethers.utils.Interface([
  `function depositAndMulticall(
    address[] tokens,
    uint256[] amounts,
    ${CALL3VALUE_STRUCT} calls,
    address refundTo,
    address nftRecipient)`
]);
const depositAndMulticallSighash = depositAndMulticallInterface.getSighash("depositAndMulticall");
const withdrawAndMulticallInterface = new ethers.utils.Interface([
  `function withdrawAndMulticall(
    address[] tokens,
    uint256[] amounts,
    ${CALL3VALUE_STRUCT} calls,
    address refundTo,
    address nftRecipient)`
]);
const withdrawAndMulticallSighash = withdrawAndMulticallInterface.getSighash("withdrawAndMulticall");

const decodeDepositAndMulticall = (tx: any, event: EventData) => {
  try {
    const decoded = depositAndMulticallInterface.decodeFunctionData("depositAndMulticall", tx.data);
    const tokens = decoded.tokens as string[];
    const amounts = decoded.amounts as ethers.BigNumber[];
    if (Array.isArray(tokens) && tokens.length) {
      event.token = tokens[0];
    }
    if (Array.isArray(amounts) && amounts.length) {
      event.amount = amounts[0]
    }
    if (amounts.length === 0 && tokens.length === 0) {
      event.amount = ethers.BigNumber.from(tx.value);
      event.token = ZERO_ADDRESS;
    }
    event.to = decoded.refundTo;
  } catch (error) {
    console.error(
      `firefly adapter: Unable to decode depositAndMulticall input for ${event.txHash}`,
      error
    );
  }
  return event;
}

const decodeWithdrawAndMulticall = (tx: any, event: EventData) => {
  try {
    const decoded = withdrawAndMulticallInterface.decodeFunctionData("withdrawAndMulticall", tx.data);
    const tokens = decoded.tokens as string[];
    const amounts = decoded.amounts as ethers.BigNumber[];
    if (Array.isArray(tokens) && tokens.length) {
      event.token = tokens[0];
    }
    if (Array.isArray(amounts) && amounts.length) {
      event.amount = amounts[0]
    }
    if (amounts.length === 0 && tokens.length === 0) {
      event.amount = ethers.BigNumber.from(tx.value);
      event.token = ZERO_ADDRESS;
    }
    event.to = decoded.refundTo;
  } catch (error) {
    console.error(
      `firefly adapter: Unable to decode withdrawAndMulticall input for ${event.txHash}`,
      error
    );
  }
  return event;
}

const decodeInputDataParams = [
  {
    sighash: depositAndMulticallSighash,
    decodeFn: decodeDepositAndMulticall
  },
  {
    sighash: withdrawAndMulticallSighash,
    decodeFn: decodeWithdrawAndMulticall
  }
]

export const processMulticallEvents = async (
  eventData: EventData[],
  chain: SupportedChains
) => {
  const provider = getProvider(chain) as any;
  const eventsToDecode = eventData.filter((event) => !event.token);

  await PromisePool.withConcurrency(5)
    .for(eventsToDecode)
    .process(async (event) => {
      const tx = await provider.getTransaction(event.txHash);
      if (!tx)
        return event;

      const decodeInputDataParam = decodeInputDataParams.find((decodeInputDataParam) => tx.data?.startsWith(decodeInputDataParam.sighash));
      if (!decodeInputDataParam)
        return event;

      return decodeInputDataParam.decodeFn(tx, event);
    });
  console.log(eventData);
  return eventData.filter((event) => event.token && event.amount);
};