import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs, makeTxHashesUnique } from "../../helpers/processTransactions";
import { ethers } from "ethers";
import { constructTransferParams } from "../../helpers/eventParams";

/*
API: https://api.axelarscan.io/cross-chain/tvl

EVM axl token addresses:
{
  fantom: [
    '0x1B6382DBDEa11d97f24495C9A90b7c88469134a4',
    '0x8b1f4432F943c465A973FeDC6d7aa50Fc96f1f65',
    '0xd226392C23fb3476274ED6759D4a478db3197d82',
    '0xD5d5350F42CB484036A1C1aF5F2DF77eAFadcAFF',
    '0x5e3c572a97d898fe359a2cea31c7d46ba5386895',
    '0x2b9d3f168905067d88d93f094c938bacee02b0cb',
    '0x3bB68cb55Fc9C22511467c18E42D14E8c959c4dA',
    '0x4000aB030f3615d1616b4C71E7129BbE3f1f9C55',
    '0xbE71e68fB36d14565F523C9c36ab2A8Be0c26D55',
    '0xE549Caf5f0c3e80b8738CB03ae4fBb4c15b0DD86',
    '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
    '0x6313874dE49737f22911c89A528282Fd8672BdAC'
  ],
  aurora: [
    '0x4268B8F0B87b6Eae5d897996E6b845ddbD99Adf3',
    '0x4818B684a810fC023C32bB6292da8D508Bd906EF',
    '0xF02eaeEa1350DAD8fc7A66d6BddB25876243ed1F',
    '0x3FF4cb8EC5EC5eBBfD3424401D962F0627a67Cac',
    '0x651fcA96C77f5f988E2Ca449B6e3a445399e2492'
  ],
  ethereum: [
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    '0x467719aD09025FcC6cF6F8311755809d45a5E5f3',
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    '0x31dab3430f3081dff3ccd80f17ad98583437b213',
    '0x085416975fe14c2a731a97ec38b9bf8135231f62',
    '0x27292cf0016E5dF1d8b37306B2A98588aCbD6fCA',
    '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    '0xDd26a5c8Ae5b60Bb14aEcED892A052CA48A2e915',
    '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
    '0x853d955aCEf822Db058eb8505911ED77F175b99e',
    '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    '0x08fe7A0db575c2a08d76EEcA71763E48C6e60F45',
    '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    '0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919',
    '0x4d224452801ACEd8B2F0aebE155379bb5D594381',
    '0xEBD3a5c8b759BD0C24518e0CD25E18cCBdd724aC',
    '0xA2cd3D43c775978A96BdBf12d733D5A1ED94fb18',
    '0xBB0E17EF65F82Ab018d8EDd776e8DD940327B28b'
  ],
  bsc: [
    '0x4268B8F0B87b6Eae5d897996E6b845ddbD99Adf3',
    '0x8b1f4432F943c465A973FeDC6d7aa50Fc96f1f65',
    '0x4818B684a810fC023C32bB6292da8D508Bd906EF',
    '0xF02eaeEa1350DAD8fc7A66d6BddB25876243ed1F',
    '0x3966001bEb78FD309665EA78FF8a4dA2E7E13180',
    '0x6204901525A8711E0621f435F86148B26712726B',
    '0x3FF4cb8EC5EC5eBBfD3424401D962F0627a67Cac',
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    '0xA7566EAC531a80A550FBeE97CEE11A66a175b9DB',
    '0x651fcA96C77f5f988E2Ca449B6e3a445399e2492'
  ],
  moonbeam: [
    '0xCa01a1D0993565291051daFF390892518ACfAD3A',
    '0x467719aD09025FcC6cF6F8311755809d45a5E5f3',
    '0xDFd74aF792bC6D45D1803F425CE62Dd16f8Ae038',
    '0x14dF360966a1c4582d2b18EDbdae432EA0A27575',
    '0x31dab3430f3081dff3ccd80f17ad98583437b213',
    '0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080',
    '0x085416975fe14c2a731a97ec38b9bf8135231f62',
    '0x27292cf0016E5dF1d8b37306B2A98588aCbD6fCA',
    '0xDd26a5c8Ae5b60Bb14aEcED892A052CA48A2e915',
    '0x61C82805453a989E99B544DFB7031902e9bac448',
    '0x08fe7A0db575c2a08d76EEcA71763E48C6e60F45',
    '0xAcc15dC74880C9944775448304B263D191c6077F',
    '0xEBD3a5c8b759BD0C24518e0CD25E18cCBdd724aC'
  ],
  polygon: [
    '0x750e4C4984a9e0f12978eA6742Bc1c5D248f40ed',
    '0x6e4E624106Cb12E168E6533F8ec7c82263358940',
    '0xCeED2671d8634e3ee65000EDbbEe66139b132fBf',
    '0xDDc9E2891FA11a4CC5C223145e8d14B44f3077c9',
    '0xa17927fb75e9faea10c08259902d0468b3dead88',
    '0xeddc6ede8f3af9b4971e1fa9639314905458be87',
    '0x33F8a5029264BcFB66e39157aF3FeA3E2a8a5067',
    '0x8CD51880C0a5dbde37dDdFce8d5B772Fc9007495',
    '0x53Adc464b488bE8C5d7269B9ABBCe8bA74195C3a',
    '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    '0xC8d5A4E04387EBdaa2c0FBB6858F246116431e9f',
    '0xD9306A03dE967F6f0B3787993b505f80Ac5fF0A2'
  ],
  avax: [
    '0xfaB550568C688d5D8A52C7d794cb93Edc26eC0eC',
    '0x44c784266cf024a60e8acF2427b9857Ace194C5d',
    '0xF976ba91b6bb3468C91E4f02E68B37bc64a57e66',
    '0xC5Fa5669E326DA8B2C35540257cD48811F40a36B',
    '0x120ad3e5a7c796349e591f1570d9f7980f4ea9cb',
    '0x260bbf5698121eb85e7a74f2e45e16ce762ebe11',
    '0x80D18b1c9Ab0c9B5D6A6d5173575417457d00a12',
    '0xE1d70994Be12b73E76889412b284A8F19b0DE56d',
    '0x4914886dBb8aAd7A7456D471EAab10b06d42348D',
    '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    '0x5A44422beaAA38031f57720d88697105be6970BE',
    '0x64b5A03db299F119889DEAC3211d80503E6cFfa2'
  ]
}
*/

const nullAddress = "0x0000000000000000000000000000000000000000";

const contractAddresses = {
  ethereum: {
    gateway: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
    tokens: [
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "0x467719aD09025FcC6cF6F8311755809d45a5E5f3",
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      "0x31dab3430f3081dff3ccd80f17ad98583437b213",
      "0x085416975fe14c2a731a97ec38b9bf8135231f62",
      "0x27292cf0016E5dF1d8b37306B2A98588aCbD6fCA",
      "0x514910771AF9Ca656af840dff83E8264EcF986CA",
      "0xDd26a5c8Ae5b60Bb14aEcED892A052CA48A2e915",
      "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
      "0x853d955aCEf822Db058eb8505911ED77F175b99e",
      "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      "0x08fe7A0db575c2a08d76EEcA71763E48C6e60F45",
      "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
      "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
      "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
      "0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919",
      "0x4d224452801ACEd8B2F0aebE155379bb5D594381",
      "0xEBD3a5c8b759BD0C24518e0CD25E18cCBdd724aC",
      "0xA2cd3D43c775978A96BdBf12d733D5A1ED94fb18",
      "0xBB0E17EF65F82Ab018d8EDd776e8DD940327B28b",
    ],
  },
  polygon: {
    gateway: "0x6f015f16de9fc8791b234ef68d486d2bf203fba8",
    tokens: [
      "0x750e4C4984a9e0f12978eA6742Bc1c5D248f40ed",
      "0x6e4E624106Cb12E168E6533F8ec7c82263358940",
      "0xCeED2671d8634e3ee65000EDbbEe66139b132fBf",
      "0xDDc9E2891FA11a4CC5C223145e8d14B44f3077c9",
      "0xa17927fb75e9faea10c08259902d0468b3dead88",
      "0xeddc6ede8f3af9b4971e1fa9639314905458be87",
      "0x33F8a5029264BcFB66e39157aF3FeA3E2a8a5067",
      "0x8CD51880C0a5dbde37dDdFce8d5B772Fc9007495",
      "0x53Adc464b488bE8C5d7269B9ABBCe8bA74195C3a",
      "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      "0xC8d5A4E04387EBdaa2c0FBB6858F246116431e9f",
      "0xD9306A03dE967F6f0B3787993b505f80Ac5fF0A2",
    ],
  },
  avax: {
    gateway: "0x5029C0EFf6C34351a0CEc334542cDb22c7928f78",
    tokens: [
      "0xfaB550568C688d5D8A52C7d794cb93Edc26eC0eC",
      "0x44c784266cf024a60e8acF2427b9857Ace194C5d",
      "0xF976ba91b6bb3468C91E4f02E68B37bc64a57e66",
      "0xC5Fa5669E326DA8B2C35540257cD48811F40a36B",
      "0x120ad3e5a7c796349e591f1570d9f7980f4ea9cb",
      "0x260bbf5698121eb85e7a74f2e45e16ce762ebe11",
      "0x80D18b1c9Ab0c9B5D6A6d5173575417457d00a12",
      "0xE1d70994Be12b73E76889412b284A8F19b0DE56d",
      "0x4914886dBb8aAd7A7456D471EAab10b06d42348D",
      "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      "0x5A44422beaAA38031f57720d88697105be6970BE",
      "0x64b5A03db299F119889DEAC3211d80503E6cFfa2",
    ],
  },
  bsc: {
    gateway: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
    tokens: [
      "0x4268B8F0B87b6Eae5d897996E6b845ddbD99Adf3",
      "0x8b1f4432F943c465A973FeDC6d7aa50Fc96f1f65",
      "0x4818B684a810fC023C32bB6292da8D508Bd906EF",
      "0xF02eaeEa1350DAD8fc7A66d6BddB25876243ed1F",
      "0x3966001bEb78FD309665EA78FF8a4dA2E7E13180",
      "0x6204901525A8711E0621f435F86148B26712726B",
      "0x3FF4cb8EC5EC5eBBfD3424401D962F0627a67Cac",
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      "0xA7566EAC531a80A550FBeE97CEE11A66a175b9DB",
      "0x651fcA96C77f5f988E2Ca449B6e3a445399e2492",
    ],
  },
  fantom: {
    gateway: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
    tokens: [
      "0x1B6382DBDEa11d97f24495C9A90b7c88469134a4",
      "0x8b1f4432F943c465A973FeDC6d7aa50Fc96f1f65",
      "0xd226392C23fb3476274ED6759D4a478db3197d82",
      "0xD5d5350F42CB484036A1C1aF5F2DF77eAFadcAFF",
      "0x5e3c572a97d898fe359a2cea31c7d46ba5386895",
      "0x2b9d3f168905067d88d93f094c938bacee02b0cb",
      "0x3bB68cb55Fc9C22511467c18E42D14E8c959c4dA",
      "0x4000aB030f3615d1616b4C71E7129BbE3f1f9C55",
      "0xbE71e68fB36d14565F523C9c36ab2A8Be0c26D55",
      "0xE549Caf5f0c3e80b8738CB03ae4fBb4c15b0DD86",
      "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
      "0x6313874dE49737f22911c89A528282Fd8672BdAC",
    ],
  },
} as {
  [chain: string]: {
    gateway: string;
    tokens: string[];
  };
};

const depositParams: PartialContractEventParams = {
  target: "",
  topic: "Transfer(address,address,uint256)",
  topics: [ethers.utils.id("Transfer(address,address,uint256)"), null, ethers.utils.hexZeroPad(nullAddress, 32)],
  abi: ["event Transfer(address indexed from, address indexed to, uint256 value)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "from",
    amount: "value",
  },
  fixedEventData: {
    token: "",
  },
  filter: {
    includeTxData: [{ to: "" }],
  },
  isDeposit: true,
};

const withdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "Transfer(address,address,uint256)",
  topics: [ethers.utils.id("Transfer(address,address,uint256)"), ethers.utils.hexZeroPad(nullAddress, 32)],
  abi: ["event Transfer(address indexed from, address indexed to, uint256 value)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    to: "to",
    amount: "value",
  },
  fixedEventData: {
    token: "",
    from: "",
  },
  filter: {
    includeTxData: [{ to: "" }],
  },
  isDeposit: false,
};

const constructParams = (chain: string) => {
  let eventParams = [] as any;
  const tokens = contractAddresses[chain].tokens;
  const gateway = contractAddresses[chain].gateway;

  tokens.map((address) => {
    const finalDepositParams = {
      ...depositParams,
      target: address,
      fixedEventData: {
        token: address,
        to: address,
      },
      filter: {
        includeTxData: [{ to: gateway }],
      },
    };
    const finalWithdrawalParams = {
      ...withdrawalParams,
      target: address,
      fixedEventData: {
        token: address,
        from: address,
      },
      filter: {
        includeTxData: [{ to: gateway }],
      },
    };
    eventParams.push(finalDepositParams, finalWithdrawalParams);
  });

  const underlyingDepositParams = constructTransferParams(gateway, true);
  const underlyingWithdrawalParams = constructTransferParams(gateway, false);
  eventParams.push(underlyingDepositParams, underlyingWithdrawalParams);

  return async (fromBlock: number, toBlock: number) => {
    const eventData = await getTxDataFromEVMEventLogs("axelar", chain as Chain, fromBlock, toBlock, eventParams);
    const uniqueHashesEventData = makeTxHashesUnique(eventData)
    return uniqueHashesEventData
  }
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  fantom: constructParams("fantom"),
  avalanche: constructParams("avax"),
  bsc: constructParams("bsc"),
};

export default adapter;
