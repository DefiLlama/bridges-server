import { ethers } from "ethers";
import { getProvider, setProvider } from "@defillama/sdk";
import providerList from "@defillama/sdk/build/providers.json";
import { Chain } from "@defillama/sdk/build/general";

import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

import * as yaml from 'js-yaml';

const baseUri = "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main";

let metadata: Record<string, any>;
let addresses: Record<string, Map<string, string>>;
const chainMapping: Record<string, string> = {};

async function setUp(): Promise<void> {
  metadata =
    await fetch(`${baseUri}/chains/metadata.yaml`)
      .then((r) => r.text())
      .then((t) => yaml.load(t));
  addresses =
    await fetch(`${baseUri}/chains/addresses.yaml`)
      .then((r) => r.text())
      .then((t) => yaml.load(t));

  for (const [, chain] of Object.entries(metadata)) {
    if (chain.isTestnet) continue;
    if (chain.protocol != "ethereum") continue;

    const provider = getProvider(chain.name);
    if (provider === null) {
      for (const p in providerList) {
        const data = providerList[p];
        if (data.chainId == chain.chainId) {
          chainMapping[chain.name] = p;
          setProvider(chain.name, getProvider(p));
          break;
        }
      }
    }
  }
  // const missing = [];
  // for (const key in metadata) {
  //     const chain = metadata[key];
  //     if (chain.isTestnet) continue;
  //     if (chain.protocol != "ethereum") continue;

  //     const provider = getProvider(chain.name);
  //     if (provider === null) missing.push(chain);
  // }
  // console.log(missing.length);
  // console.log(missing);
};

function bytes32ToAddress(bytes32: string) {
  return ethers.utils.getAddress('0x' + bytes32.slice(26));
}

function constructParams(chain: string) {
  let eventParams = [] as PartialContractEventParams[];
  const mailboxAddress = ethers.utils.getAddress(addresses[chain].mailbox);

  function buildFilter(eventName: string): () => Promise<boolean> {
    return async (provider, iface, txHash) => {
      const txReceipt = await provider.getTransactionReceipt(txHash);
      if (!txReceipt) return true;

      let toFilter = true;
      txReceipt.logs.map((log) => {
        let parsed;
        try {
          parsed = iface.parseLog(log);
        } catch { return; }
        // console.log(parsed);
        // console.log(ethers.utils.getAddress(log.address));
        if (ethers.utils.getAddress(log.address) === mailboxAddress && parsed.name === eventName) {
          toFilter = false;
        }
      });
      return toFilter;
    }
  }

  const commonParams = {
    target: null,
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
      from: "address",
      token: "address",
    },
    argKeys: {
      to: "recipient",
      amount: "amount",
    },
    argGetters: {
      to: (log: any) => { bytes32ToAddress(log.recipient); }
    },
  };
  const depositParams: PartialContractEventParams = {
    ...commonParams,
    topic: "SentTransferRemote(uint32,bytes32,uint256)",
    abi: [
      "event SentTransferRemote(uint32 indexed destination, bytes32 indexed recipient, uint256 amount)",
      "event Dispatch(address indexed sender, uint32 indexed destination, bytes32 indexed recipient, bytes message)",
    ],
    isDeposit: true,
    filter: {
      custom: buildFilter("Dispatch")
    },
  };

  const withdrawParams: PartialContractEventParams = {
    ...commonParams,
    topic: "ReceivedTransferRemote(uint32,bytes32,uint256)",
    abi: [
      "event ReceivedTransferRemote(uint32 indexed origin, bytes32 indexed recipient, uint256 amount)",
      "event Process(uint32 indexed origin, bytes32 indexed sender, address indexed recipient)",
    ],
    isDeposit: false,
    filter: {
      custom: buildFilter("Process")
    },
  };

  eventParams.push(depositParams, withdrawParams);

  return async (fromBlock: number, toBlock: number) => {
    return await getTxDataFromEVMEventLogs("hyperlane", (chainMapping[chain] || chain) as Chain, fromBlock, toBlock, eventParams);
  }
}

const excludedChains = [
  "cheesechain", // TODO: not available in defillama sdk providerList, can be added manually
  "lumia", // TODO: not available in defillama sdk providerList, can be added manually
];

async function buildAdapter(): Promise<BridgeAdapter> {
  await setUp();

  const adapter: BridgeAdapter = {
  }

  for (const key in metadata) {
    const chain = metadata[key];
    if (chain.isTestnet) continue;
    if (chain.protocol != "ethereum") continue;

    if (!addresses.hasOwnProperty(key)) continue;
    if (excludedChains.includes(key)) continue;

    const adapterKey = chainMapping[key] || key;
    adapter[adapterKey] = constructParams(key);
  }

  return adapter;
}

export default buildAdapter();
