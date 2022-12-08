import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs, makeTxHashesUnique } from "../../helpers/processTransactions";
import { ethers } from "ethers";
import { constructTransferParams } from "../../helpers/eventParams";

const nullAddress = "0x0000000000000000000000000000000000000000";

const contractAddresses = {
  ethereum: {
    ERC20Handler: "0xEa31ca828F53A41bA2864FA194bb8A2d3f11C0C0",
    tokens: [
      "0xBd2949F67DcdC549c6Ebe98696449Fa79D988A9F",
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      "0xCF3C8Be2e2C42331Da80EF210e9B1b307C03d36A",
      "0xaC0104Cca91D167873B8601d2e71EB3D4D8c33e0",
      "0xABe580E7ee158dA464b51ee1a83Ac0289622e6be",
      "0xD478161C952357F05f0292B56012Cd8457F1cfbF",
      "0xa58a4f5c4Bb043d2CC1E170613B74e767c94189B",
      "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      "0x0Def8d8addE14c9eF7c2a986dF3eA4Bd65826767",
      "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    ],
  },
  bsc: {
    ERC20Handler: "0x83354D47379881e167F7160A80dAC8269Fe946Fa",
    tokens: [
      "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      "0xbcf39F0EDDa668C58371E519AF37CA705f2bFcbd"
    ],
  },
  moonriver: {
    ERC20Handler: "0xB1eFA941D6081afdE172e29D870f1Bbb91BfABf7",
    tokens: [
      "0xbD90A6125a84E5C512129D622a75CDDE176aDE5E",
      "0x5c22ba65F65ADfFADFc0947382f2E7C286A0Fe45",
      "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D"
    ],
  },
  meter: {
    ERC20Handler: "0x139d9b458acda76457dd99db3a6a36ca9cb3bbf1",
    tokens: [
      "0x228ebBeE999c6a7ad74A6130E81b12f9Fe237Ba3",
      "0x8df95e66cb0ef38f91d2776da3c921768982fba0"
    ],
  },
  fantom: {
    ERC20Handler: "0xe1c892A6cE33cB31c100369aA6fC302d7B96254a",
    tokens: [
      "0x1336739b05c7ab8a526d40dcc0d04a826b5f8b03"
    ],
  },
} as {
  [chain: string]: {
    ERC20Handler: string;
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
  const gateway = contractAddresses[chain].ERC20Handler;

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
  bsc: constructParams("bsc"),
  moonriver: constructParams("moonriver"),
  meter: constructParams("meter"),
  theta: constructParams("theta")
};

export default adapter;
