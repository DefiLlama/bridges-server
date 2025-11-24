import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

type Address = `0x${string}`;

interface Deployment {
  oapp: Address;
  token: Address;
}

const deployments = {
  arbitrum: [{
      oapp: "0x14E4A1B13bf7F943c8ff7C51fb60FA964A298D92",
      token: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
  }],
  berachain: [{
      oapp: "0x3Dc96399109df5ceb2C226664A086140bD0379cB",
      token: "0x779Ded0c9e1022225f8E0630b35a9b54bE713736",
  }],
  conflux: [{
      oapp: "0xC57efa1c7113D98BdA6F9f249471704Ece5dd84A",
      token: "0xaf37E8B6C9ED7f6318979f56Fc287d76c30847ff",
  }],
  corn: [{
      oapp: "0x3f82943338a8a76c35BFA0c1828aA27fd43a34E4",
      token: "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb",
  }],
  ethereum: [{
      oapp: "0x6C96dE32CEa08842dcc4058c14d3aaAD7Fa41dee",
      token: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
  }],
  flare: [{
      oapp: "0x567287d2A9829215a37e3B88843d32f9221E7588",
      token: "0xe7cd86e13AC4309349F30B3435a9d337750fC82D",
  }],
  hyperliquid: [{
      oapp: "0x904861a24F30EC96ea7CFC3bE9EA4B476d237e98",
      token: "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb",
  }],
  ink: [{
    oapp: "0x1cB6De532588fCA4a21B7209DE7C456AF8434A65",
    token: "0x0200C29006150606B650577BBE7B6248F58470c1",
  }],
  optimism: [{
    oapp: "0xF03b4d9AC1D5d1E7c4cEf54C2A313b9fe051A0aD",
    token: "0x01bFF41798a0BcF287b996046Ca68b395DbC1071",
  }],
  plasma: [{
    oapp: "0x02ca37966753bDdDf11216B73B16C1dE756A7CF9",
    token: "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb",
  }],
  polygon: [{
    oapp: "0x6BA10300f0DC58B7a1e4c0e41f5daBb7D7829e13",
    token: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  }],
  rootstock: [{
    oapp: "0x1a594d5d5d1c426281C1064B07f23F57B2716B61",
    token: "0x779Ded0c9e1022225f8E0630b35a9b54bE713736",
  }],
  sei: [{
    oapp: "0x56Fe74A2e3b484b921c447357203431a3485CC60",
    token: "0x9151434b16b9763660705744891fA906F660EcC5",
  }],
  unichain: [{
    oapp: "0xc07bE8994D035631c36fb4a89C918CeFB2f03EC3",
    token: "0x9151434b16b9763660705744891fA906F660EcC5",
  }],
} satisfies Record<Chain, Deployment[]>;

const depositParams = {
  topic: "OFTSent(bytes32,uint32,address,uint256,uint256)",
  abi: [
    "event OFTSent(bytes32 indexed guid, uint32 dstEid, address indexed fromAddress, uint256 amountSentLD, uint256 amountReceivedLD)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "fromAddress",
    amount: "amountSentLD",
  },
  isDeposit: true,
} satisfies Partial<PartialContractEventParams>;

const withdrawalParams = {
  topic: "OFTReceived(bytes32,uint32,address,uint256)",
  abi: ["event OFTReceived(bytes32 indexed guid, uint32 srcEid, address indexed toAddress, uint256 amountReceivedLD)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    to: "toAddress",
    amount: "amountReceivedLD",
  },
  isDeposit: false,
} satisfies Partial<PartialContractEventParams>;

const constructParams = (chain: keyof typeof deployments) => {
  const eventParams = deployments[chain].flatMap(deployment => [
    {
      ...depositParams,
      target: deployment.oapp,
      fixedEventData: {
        token: deployment.token,
        to: deployment.token,
      },
    },
    {
      ...withdrawalParams,
      target: deployment.oapp,
      fixedEventData: {
        token: deployment.token,
        from: deployment.token,
      },
    },
  ]);

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("usdt0", chain, fromBlock, toBlock, eventParams);
}

const adapter: BridgeAdapter = Object.fromEntries((Object.keys(deployments) as Array<keyof typeof deployments>).map(chain => [chain, constructParams(chain)]));

export default adapter;