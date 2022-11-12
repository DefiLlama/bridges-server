import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs, getNativeTokenTransfersFromHash } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxsBlockRangeEtherscan, etherscanWait } from "../../helpers/etherscan";
import { EventData } from "../../utils/types";

/*
****TODO: All withdrawals of wrapped wormhole assets are missed. Need to get them from null address xfers.

Contracts: https://book.wormhole.com/reference/contracts.html

***Ethereum***
0x3ee18B2214AFF97000D974cf647E7C347E8fa585 is Wormhole: Portal Token Bridge

***Polygon***
0x5a58505a96D1dbf8dF91cB21B54419FC36e93fdE is Wormhole: Portal Token Bridge

***BSC***
0xB6F6D86a8f9879A9c87f643768d9efc38c1Da6E7 is Wormhole: Portal Token Bridge

***Fantom***
0x7C9Fc5741288cDFdD83CeB07f3ea7e22618D79D2 is Wormhole: Portal Token Bridge

***Avalanche***
0x0e082F06FF657D94310cB8cE8B0D9a04541d8052 is Wormhole: Portal Token Bridge

***Aurora***
0x51b5123a7b0F9b2bA265f9c4C8de7D78D52f510F is Wormhole: Portal Token Bridge

***Celo***
0x796Dff6D74F3E27060B71255Fe517BFb23C93eed is Wormhole: Portal Token Bridge

***Klaytn***
0x5b08ac39EAED75c0439FC750d9FE7E1F9dD0193F is Wormhole: Portal Token Bridge
*/

const contractAddresses = {
  ethereum: {
    tokenBridge: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
    nativeToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  polygon: {
    tokenBridge: "0x5a58505a96D1dbf8dF91cB21B54419FC36e93fdE",
    nativeToken: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  },
  fantom: {
    tokenBridge: "0x7C9Fc5741288cDFdD83CeB07f3ea7e22618D79D2",
    nativeToken: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
  },
  avax: {
    tokenBridge: "0x0e082F06FF657D94310cB8cE8B0D9a04541d8052",
    nativeToken: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
  },
  bsc: {
    tokenBridge: "0xB6F6D86a8f9879A9c87f643768d9efc38c1Da6E7",
    nativeToken: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  },
  aurora: {
    tokenBridge: "0x51b5123a7b0F9b2bA265f9c4C8de7D78D52f510F",
    nativeToken: "0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB",
  },
  celo: {
    tokenBridge: "0x796Dff6D74F3E27060B71255Fe517BFb23C93eed",
    nativeToken: "0x471EcE3750Da237f93B8E339c536989b8978a438",
  },
  klaytn: {
    tokenBridge: "0x5b08ac39EAED75c0439FC750d9FE7E1F9dD0193F",
    nativeToken: "0xe4f05a66ec68b54a58b17c22107b02e0232cc817",
  },
} as {
  [chain: string]: {
    tokenBridge: string;
    nativeToken: string;
  };
};

const nativeTokenTransferSignatures = {
  ethereum: ["0x998150", "0xff200c"],
  fantom: ["0x998150", "0xff200c"],
  bsc: ["0x998150", "0xff200c"],
  polygon: ["0x998150", "0xff200c"],
  avax: ["0x998150", "0xff200c"],
  arbitrum: ["0x998150", "0xff200c"],
  optimism: ["0x998150", "0xff200c"],
  aurora: ["0x998150", "0xff200c"],
} as { [chain: string]: string[] };

const constructParams = (chain: string) => {
  let eventParams = [] as any;
  const chainAddresses = contractAddresses[chain];
  const address = chainAddresses.tokenBridge;
  const nativeToken = chainAddresses.nativeToken;

  const depositEventParams: PartialContractEventParams = constructTransferParams(address, true);
  const withdrawalEventParams: PartialContractEventParams = constructTransferParams(address, false, {
    excludeTo: ["0x0000000000000000000000000000000000000000"],
  });
  eventParams.push(depositEventParams, withdrawalEventParams);

  return async (fromBlock: number, toBlock: number) => {
    const eventLogData = await getTxDataFromEVMEventLogs("portal", chain as Chain, fromBlock, toBlock, eventParams);

    // for native token transfers, only able to get from subgraph, Etherscan API, etc.
    // skipped for chains without available API
    let nativeTokenData = [] as EventData[];
    if (["ethereum", "polygon", "fantom", "avalanche", "bsc", "aurora", "celo"].includes(chain)) {
      const signatures = nativeTokenTransferSignatures[chain];
      if (!nativeToken) {
        throw new Error(`Chain ${chain} is missing native token address.`);
      }
      await etherscanWait();
      const txs = await getTxsBlockRangeEtherscan(chain, address, fromBlock, toBlock, {
        includeSignatures: signatures,
      });
      if (txs.length) {
        const hashes = txs.map((tx: any) => tx.hash);
        const nativeTokenTransfers = await getNativeTokenTransfersFromHash(
          chain as Chain,
          hashes,
          address,
          nativeToken
        );
        nativeTokenData = [...nativeTokenTransfers, ...nativeTokenData];
      }
    }
    return [...eventLogData, ...nativeTokenData];
  };
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  fantom: constructParams("fantom"),
  avalanche: constructParams("avax"),
  bsc: constructParams("bsc"),
  aurora: constructParams("aurora"),
  celo: constructParams("celo"),
  //klaytn: constructParams("klaytn"),
};

export default adapter;
