// Wormhole: Portal core and token bridge contract addresses
// https://docs.wormhole.com/wormhole/blockchain-environments/environments
export const contractAddresses = {
  ethereum: {
    tokenBridge: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
    coreBridge: "0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B",
  },
  polygon: {
    tokenBridge: "0x5a58505a96D1dbf8dF91cB21B54419FC36e93fdE",
    coreBridge: "0x7A4B5a56256163F07b2C80A7cA55aBE66c4ec4d7",
  },
  fantom: {
    tokenBridge: "0x7C9Fc5741288cDFdD83CeB07f3ea7e22618D79D2",
    coreBridge: "0x126783A6Cb203a3E35344528B26ca3a0489a1485",
  },
  avax: {
    tokenBridge: "0x0e082F06FF657D94310cB8cE8B0D9a04541d8052",
    coreBridge: "0x54a8e5f9c4CbA08F9943965859F6c34eAF03E26c",
  },
  bsc: {
    tokenBridge: "0xB6F6D86a8f9879A9c87f643768d9efc38c1Da6E7",
    coreBridge: "0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B",
  },
  aurora: {
    tokenBridge: "0x51b5123a7b0F9b2bA265f9c4C8de7D78D52f510F",
    coreBridge: "0xa321448d90d4e5b0A732867c18eA198e75CAC48E",
  },
  celo: {
    tokenBridge: "0x796Dff6D74F3E27060B71255Fe517BFb23C93eed",
    coreBridge: "0xa321448d90d4e5b0A732867c18eA198e75CAC48E",
  },
  klaytn: {
    tokenBridge: "0x5b08ac39EAED75c0439FC750d9FE7E1F9dD0193F",
    coreBridge: "0x0C21603c4f3a6387e241c0091A7EA39E43E90bb7",
  },
  moonbeam: {
    tokenBridge: "0xb1731c586ca89a23809861c6103f0b96b3f57d92",
    coreBridge: "0xC8e2b0cD52Cf01b0Ce87d389Daa3d414d4cE29f3",
  },
  optimism: {
    tokenBridge: "0x1D68124e65faFC907325e3EDbF8c4d84499DAa8b",
    coreBridge: "0xEe91C335eab126dF5fDB3797EA9d6aD93aeC9722",
  },
  arbitrum: {
    tokenBridge: "0x0b2402144Bb366A632D14B83F244D2e0e21bD39c",
    coreBridge: "0xa5f208e072434bC67592E4C49C1B991BA79BCA46",
  },
  base: {
    tokenBridge: "0x8d2de8d2f73F1F4cAB472AC9A881C9b123C79627",
    coreBridge: "0xbebdb6C8ddC678FfA9f8748f85C815C556Dd8ac6",
  },
  solana: {
    tokenBridge: "wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb",
    coreBridge: "worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth",
  },
} as {
  [chain: string]: {
    tokenBridge: string;
    coreBridge: string;
  };
};
