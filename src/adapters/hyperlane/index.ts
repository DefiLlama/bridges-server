import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { BigNumber } from "ethers";

type ChainToAddress = { [chain: string]: string };

/* Addresses Source: https://github.com/hyperlane-xyz/hyperlane-registry */
// TODO: Automate intake from @hyperlane-xyz/registry (will need new APIs exposed)

/* Mailbox Contract: https://github.com/hyperlane-xyz/hyperlane-monorepo/blob/main/solidity/contracts/Mailbox.sol */
const MAILBOXES: ChainToAddress = {
  ancient8: '0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7',
  arbitrum: '0x979Ca5202784112f4738403dBec5D0F3B9daabB9',
  avalanche: '0xFf06aFcaABaDDd1fb08371f9ccA15D73D51FeBD6',
  base: '0xeA87ae93Fa0019a82A727bfd3eBd1cFCa8f64f1D',
  blast: '0x3a867fCfFeC2B790970eeBDC9023E75B0a172aa7',
  bsc: '0x2971b9Aec44bE4eb673DF1B88cDB57b96eefe8a4',
  celo: '0x50da3B3907A08a24fe4999F4Dcf337E8dC7954bb',
  ethereum: '0xc005dc82818d67AF737725bD4bf75435d065D239',
  fraxtal: '0x2f9DB5616fa3fAd1aB06cB2C906830BA63d135e3',
  gnosis: '0xaD09d78f4c6b9dA2Ae82b1D34107802d380Bb74f',
  holesky: '0x46f7C5D896bbeC89bE1B19e4485e59b4Be49e9Cc',
  inevm: '0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7',
  linea: '0x02d16BC51af6BfD153d67CA61754cF912E82C4d9',
  mantapacific: '0x3a464f746D23Ab22155710f44dB16dcA53e0775E',
  mode: '0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7',
  moonbeam: '0x094d03E751f49908080EFf000Dd6FD177fd44CC3',
  optimism: '0xd4C1905BB1D26BC93DAC913e13CaCC278CdCC80D',
  polygon: '0x5d934f4e2f797775e53561bB72aca21ba36B96BB',
  polygonzkevm: '0x3a464f746D23Ab22155710f44dB16dcA53e0775E',
  redstone: '0xeA87ae93Fa0019a82A727bfd3eBd1cFCa8f64f1D',
  scroll: '0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7',
  sei: '0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7',
  viction: '0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7',
  zetachain: '0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7',
};

const ECLIP_TOKENS: ChainToAddress = {
  neutron: "neutron1dvzvf870mx9uf65uqhx40yzx9gu4xlqqq2pnx362a0ndmustww3smumrf5", // 2+
  arbitrum: "0x93ca0d85837FF83158Cd14D65B169CdB223b1921",
};

const ETH_TOKENS: ChainToAddress = {
  ethereum: "0x15b5D6B614242B118AA404528A7f3E2Ad241e4A4",
  viction: "0x182e8d7c5f1b06201b102123fc7df0eaeb445a7b",
}

/* HypXERC20 Contract: https://github.com/hyperlane-xyz/hyperlane-monorepo/blob/main/solidity/contracts/token/extensions/HypXERC20.sol */
/* HypXERC20Lockbox Contract: https://github.com/hyperlane-xyz/hyperlane-monorepo/blob/main/solidity/contracts/token/extensions/HypXERC20Lockbox.sol */
const ezETH_TOKENS: ChainToAddress = {
  bsc: "0x6266e803057fa68C35018C3FB0B59db7129C23BB",
  arbitrum: "0xC8F280d3eC30746f77c28695827d309d16939BF1",
  optimism: "0x1d1a210E71398c17FD7987eDF1dc347539bB541F",
  base: "0x584BA77ec804f8B6A559D196661C0242C6844F49",
  blast: "0x8C603c6BDf8a9d548fC5D2995750Cc25eF59183b",
  mode: "0xcd95B8dF351400BF4cbAb340b6EfF2454aDB299E",
  linea: "0xcd95B8dF351400BF4cbAb340b6EfF2454aDB299E",
  ethereum: "0xdFf621F952c23972dFD3A9E5d7B9f6339e9c078B",
};

const INJ_TOKENS: ChainToAddress = {
  injective: "inj1mv9tjvkaw7x8w8y9vds8pkfq46g2vcfkjehc6k",
  inevm: "0x26f32245fCF5Ad53159E875d5Cae62aEcf19c2d4",
};

const milkTIA_TOKENS: ChainToAddress = {
  osmosis: "osmo17xuecsykqw2xcxwv8cau7uy4hgdwqt0u4qxflyc2yshhggpazfjs6kfqd3",
  mantapacific: "0x32474653127048d9fC20000e21dEd396b47968E8",
};

const nTIA_ARBITRUM_TOKENS: ChainToAddress = {
  neutron: "neutron1jyyjd3x0jhgswgm6nnctxvzla8ypx50tew3ayxxwkrjfxhvje6kqzvzudq",  // 2+
  arbitrum: "0xD56734d7f9979dD94FAE3d67C7e928234e71cD4C",
};

const oTIA_MANTA_TOKENS: ChainToAddress = {
  osmosis: "osmo1h4y9xjcvs8lrx4z8ha48uq9a338w74dpl2ly3tf74fzvugp2kj4q9l0jkw",
  mantapacific: "0x88410F3D8135b4D23b98dC37C4652C6969a5B1a8",
};

const nTIA_MANTA_PACIFIC_TOKENS: ChainToAddress = {
  neutron: "neutron1ch7x3xgpnj62weyes8vfada35zff6z59kt2psqhnx9gjnt2ttqdqtva3pa", // 2+
  mantapacific: "0x6Fae4D9935E2fcb11fC79a64e917fb2BF14DaFaa",
};

const ETH_ANCIENT8_TOKENS: ChainToAddress = {
  ethereum: "0x8b4192B9Ad1fCa440A5808641261e5289e6de95D",
  ancient8: "0x97423A68BAe94b5De52d767a17aBCc54c157c0E5",
};

const ETH_INEVM_TOKENS: ChainToAddress = {
  ethereum: "0xED56728fb977b0bBdacf65bCdD5e17Bb7e84504f",
  inevm: "0x8358d8291e3bedb04804975eea0fe9fe0fafb147",
};

const ETH_VICTION_TOKENS: ChainToAddress = {
  ethereum: "0x31Dca7762930f56D81292f85E65c9D67575804fE",
  viction: "0xbda330ea8f3005c421c8088e638fbb64fa71b9e0",
};

const HYPERLANE_TOKENS_SET: ChainToAddress[] = [
  ECLIP_TOKENS,
  ETH_TOKENS,
  ezETH_TOKENS,
  INJ_TOKENS,
  milkTIA_TOKENS,
  nTIA_ARBITRUM_TOKENS,
  oTIA_MANTA_TOKENS,
  nTIA_MANTA_PACIFIC_TOKENS,
  ETH_ANCIENT8_TOKENS,
  ETH_INEVM_TOKENS,
  ETH_VICTION_TOKENS,
];

/* NOTE: Can't pull– hyperlane-registry out-of-date. */
const HYPERLANE_CORE_CHAINS = Object.keys({
  ...MAILBOXES,
  ...ECLIP_TOKENS,
  ...ETH_TOKENS,
  ...ezETH_TOKENS,
  ...INJ_TOKENS,
  ...milkTIA_TOKENS,
  ...nTIA_ARBITRUM_TOKENS,
  ...oTIA_MANTA_TOKENS,
  ...nTIA_MANTA_PACIFIC_TOKENS,
  ...ETH_ANCIENT8_TOKENS,
  ...ETH_INEVM_TOKENS,
  ...ETH_VICTION_TOKENS,
});

const getMailboxParams = (
  mailboxAddress: string,
  token: string,
): PartialContractEventParams[] => {
    const mailboxDispatchParams: PartialContractEventParams = {
      target: mailboxAddress,
      topic: "Dispatch(address,uint32,bytes32,bytes)",
      abi: [
        "event Dispatch(address indexed sender, uint32 indexed destination, bytes32 indexed recipient, bytes message)"
      ],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
      argKeys: {
        from: "sender",
        to: "recipient",
        amount: "message",
      },
      argGetters: {
        amount: (log: any) => BigNumber.from(log.message),
      },
      fixedEventData: {
        token,
      },
      isDeposit: true,
      // inputDataExtraction: {
      //   inputDataABI: [
      //     "function dispatch(uint32 destinationDomain, bytes32 recipientAddress, bytes calldata messageBody)"
      //   ],
      //   inputDataFnName: "dispatch",
      //   inputDataKeys: {
      //     amount: "messageBody",
      //   },
      //   useDefaultAbiEncoder: true,
      // },
    };

    const mailboxProcessParams: PartialContractEventParams = {
      target: mailboxAddress,
      topic: "Process(uint32,bytes32,address)",
      abi: [
        "event Process(uint32 indexed origin, bytes32 indexed sender, address indexed recipient)"
      ],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
      argKeys: {
        from: "sender",
        to: "recipient",
      },
      fixedEventData: {
        token,
      },
      isDeposit: false,
    };
    return [mailboxDispatchParams, mailboxProcessParams];
};

const constructParams = (chain: string) => {
  let eventParams: PartialContractEventParams[] = [];

  const mailbox: string = MAILBOXES[chain];

  if (mailbox) {
    for (const hyperlaneTokens of HYPERLANE_TOKENS_SET) {
      const hyperlaneToken: string = hyperlaneTokens[chain];
      if (hyperlaneToken) eventParams.push(...getMailboxParams(mailbox, hyperlaneToken));
    }
  }

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs(
      "hyperlane",
      chain as Chain,
      fromBlock,
      toBlock,
      eventParams
    );
};

const adapter: BridgeAdapter = {
  ancient8: constructParams("ancient8"),
  arbitrum: constructParams("arbitrum"),
  avalanche: constructParams("avalanche"),
  base: constructParams("base"),
  blast: constructParams("blast"),
  bsc: constructParams("bsc"),
  celo: constructParams("celo"),
  ethereum: constructParams("ethereum"),
  fraxtal: constructParams("fraxtal"),
  gnosis: constructParams("gnosis"),
  holesky: constructParams("holesky"),
  inevm: constructParams("inevm"),
  linea: constructParams("linea"),
  mantapacific: constructParams("mantapacific"),
  mode: constructParams("mode"),
  moonbeam: constructParams("moonbeam"),
  optimism: constructParams("optimism"),
  polygon: constructParams("polygon"),
  polygonzkevm: constructParams("polygonzkevm"),
  redstone: constructParams("redstone"),
  scroll: constructParams("scroll"),
  sei: constructParams("sei"),
  viction: constructParams("viction"),
  zetachain: constructParams("zetachain"),
}

export default adapter;
