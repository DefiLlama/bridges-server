import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs, getNativeTokenTransfersFromHash } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxsBlockRangeEtherscan, getEtherscanLock, setTimer } from "../../helpers/etherscan";
import { EventData } from "../../utils/types";

/*
***Ethereum***
0xBa8Da9dcF11B50B03fd5284f164Ef5cdEF910705 is Multichain: Router V6 (WETH)
0xe95fD76CF16008c12FF3b3a937CB16Cd9Cc20284 is Multichain: Router V3
0x6b7a87899490EcE95443e979cA9485CBE7E71522 is Multichain: Router V4
has some kind of vulnerability, there appears to be some deposits that are actually hack transfers, 
where the transferred token is actually the vulnerable address 
see https://medium.com/multichainorg/action-required-critical-vulnerability-for-six-tokens-6b3cbd22bfc0
0x765277EebeCA2e31912C9946eAe1021199B39C61 is Multichain: Router V4 2

no way to get the actual token address from tx logs, only the anyERC version
need to map all of them (using tokenTransform)

***Polygon***
0x4f3Aff3A747fCADe12598081e80c6605A8be192F is Multichain: Router V4
0x2eF4A574b72E1f555185AfA8A09c6d1A8AC4025C is Anyswap: Router V6
0xAFAace7138ab3c2BCb2DB4264F8312e1Bbb80653 is Anyswap: Router V3

***Fantom***
0x1ccca1ce62c62f7be95d4a67722a8fdbed6eecb4 is Anyswap: Router V4
0x0B23341fA1Da0171f52aA8Ef85f3946b44d35ac0 is Anyswap: Router V6
0xf3Ce95Ec61114a4b1bFC615C16E6726015913CCC is Anyswap: Router V3

***Avalanche***
0x833F307aC507D47309fD8CDD1F835BeF8D702a93 is Multichain: Router V6
0x05f024C6F5a94990d32191D6f36211E3Ee33504e is Anyswap: Router V6
0xB0731d50C681C45856BFc3f7539D5f61d4bE81D8 is Anyswap: Router V4
0x9b17bAADf0f21F03e35249e0e59723F34994F806 is Anyswap: Router V3

***BSC***
0xe1d592c3322f1F714Ca11f05B6bC0eFEf1907859 is Anyswap: Router V6
0xf9736ec3926703e85C843FC972BD89A7f8E827C0 is Multichain: Router V3
0xABd380327Fe66724FFDa91A87c772FB8D00bE488 is Anyswap: Router V4

***Arbitrum***
0x650Af55D5877F289837c30b94af91538a7504b76 is Multichain: Router V6
0x0caE51e1032e8461f4806e26332c030E34De3aDb is Anyswap: Router V3
0xC931f61B1534EB21D8c11B24f3f5Ab2471d4aB50 is Multichain: Router V4

***Optimism***
0xDC42728B0eA910349ed3c6e1c9Dc06b5FB591f98 is Anyswap: Router V6

*/

const contractAddresses = {
  ethereum: {
    routers: [
      "0xBa8Da9dcF11B50B03fd5284f164Ef5cdEF910705",
      "0x6b7a87899490EcE95443e979cA9485CBE7E71522",
      "0x765277EebeCA2e31912C9946eAe1021199B39C61",
      "0xe95fD76CF16008c12FF3b3a937CB16Cd9Cc20284",
    ],
    EOAs: [
      "0xFc7cc7C7e7985316d23104B9689C511134f59bc8", // astar
      "0x13B432914A996b0A48695dF9B2d701edA45FF264", // bnb
      "0xC564EE9f21Ed8A2d8E7e76c085740d5e4c5FaFbE", // fantom
      "0x87bCB3038988ca2A89605fFa8f237FB78Df1c3Ae", // fuse
      "0x46290B0c3A234E3d538050d8F34421797532A827", // fusion
      "0xD779967F8B511C5edf39115341B310022900eFED", // huobi
      "0x923e0a17F49Fb03d936F2af2D59D379C615f5447", // kcc
      "0xEC4486a90371c9b66f499Ff3936F29f0D5AF8b7E", // moonbeam
      "0x10c6b61DbF44a083Aec3780aCF769C77BE747E23", // moonriver
      "0xE4cf417081A0Ab3f964b44D904BC2b534351A9a7", // oasis
      "0x533e3c0e6b48010873B947bddC4721b1bDFF9648", // old bsc
      "0x4E67df0f232C3bc985F8a63326D80ce3d9A40400", // shiden
      "0x8cC49FE67A4bD7a15674c4ffD4E969D94304BBbf", // syscoin
      "0x57ed6BD35a6CE815079855CD0b21331d1D5D0A0e", // telos
      "0xCDd83050f045ab31B884f0Dc49581BC7b3e0B84C", // velas
      "0xBe008e52c5682A49dd0260735a26Aa221f303456",
      "0x65e64963b755043CA4FFC88029FfB8305615EeDD",
      "0x668b9734FfE9eE8a01d4Ade3362De71E8989EA87",
      "0x2F10c5eE93ac666dA72195abA8a49FD6D27fA02F",
      "0x820A9eb227BF770A9dd28829380d53B76eAf1209",
      "0x97cFFC8aaDC28cda8Ba901667222d6386A46f705",
      "0x183D0dC5867c01bFB1dbBc41d6a9d3dE6e044626",
      "0x80641af4A0e1dcD69d7EA75ceB8D661baa84297c",
      "0xbd40733A2F223fF32195a759a81df25E35DD4dEA",
      "0x896be9f48b225154593A84b382d927F9d7Bc2361",
      "0x373590a576ccb8143f377DB5f1c16F9f8528a8B4",
      "0x9c1F1f8d03f5cca7a5D31b56D90c967B1D8cFAb7",
      "0x353B98DDc927173005dD8B293B043Bd950cDA468",
      "0xF62385C78f3BDBff33145703546b0377853AAa77",
      "0x55F089d5f6aeDfdACBD5E3aCB0e8F31FBAb44088",
      "0x7F923dB3d90047D75D078e29b1f8Eac03e30F761",
    ],
    nativetoken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  polygon: {
    routers: [
      "0x4f3Aff3A747fCADe12598081e80c6605A8be192F",
      "0x2eF4A574b72E1f555185AfA8A09c6d1A8AC4025C",
      "0xAFAace7138ab3c2BCb2DB4264F8312e1Bbb80653",
    ],
    EOAs: [
      "0xeA2368b69d09cEf7C8b1817A930b8e2185253F53",
      "0xDe829c03b442912D0e29822dE06032e937F172BB",
      "0x25864a712C80d33Ba1ad7c23CffA18b46F2fc00c",
      "0x5A3eD12E6E6928182dc402d8530087b956Ce8fdb",
      "0x01aeFAC4A308FbAeD977648361fBAecFBCd380C7",
      "0xb44022e04fd4A1219E58aB0A773bf34181c35c59",
      "0xFf3259029830ddeDaDBc104056Ec73B176EE1c3e",
    ],
    nativeToken: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  },
  fantom: {
    routers: [
      "0x1ccca1ce62c62f7be95d4a67722a8fdbed6eecb4",
      "0x0B23341fA1Da0171f52aA8Ef85f3946b44d35ac0",
      "0xf3Ce95Ec61114a4b1bFC615C16E6726015913CCC",
    ],
    EOAs: [
      "0xf778F4D7a14A8CB73d5261f9C61970ef4E7D7842",
      "0xE3e0C14bbCBF86b3Ff60E8666C070d34b84F3f73",
      "0x6a0508D476B9D9b9B6502a3bEab6A94ad8b30c85",
    ],
    nativeToken: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
  },
  avax: {
    routers: [
      "0x833F307aC507D47309fD8CDD1F835BeF8D702a93",
      "0x05f024C6F5a94990d32191D6f36211E3Ee33504e",
      "0xB0731d50C681C45856BFc3f7539D5f61d4bE81D8",
      "0x9b17bAADf0f21F03e35249e0e59723F34994F806",
    ],
    EOAs: [
      "0x54BD3FD7F45E4A20B4875254464e98730AacE4B9",
      "0x6B8b38B62fAC69A2077315F1398464f7Bfb752Dc",
      "0x4E13c3c78094E60Cef02D87fD266CD7AeD415F17", // moonbeam
    ],
    nativeToken: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
  },
  bsc: {
    /*
    routers: [
      "0xe1d592c3322f1F714Ca11f05B6bC0eFEf1907859",
      "0xf9736ec3926703e85C843FC972BD89A7f8E827C0",
      "0xABd380327Fe66724FFDa91A87c772FB8D00bE488",
    ],
    */
    EOAs: [
      "0xb1CB88B1a1992deB4189Ea4f566b594c13392Ada", // avax
      "0x4b3B4120d4D7975455d8C2894228789c91a247F8", // fantom
      "0xd6faf697504075a358524996b132b532cc5D0F14", // moonriver
      "0xAd1A0d92db9157ac9EF7ee74Be38940f60BcafA9", // arbitrum
      "0xB16E3336699A636DD6C8246A3a12b813bFa0A3AD", // ethereum
      "0x63a3d28bB9187809553dD16981C73f498B6b2687", // okex
      "0xd9B4aE62721d6311d67566A32E75f9002447922e", // moonbeam
      "0xE09C98F97DaFb1f954cEA0Ce550383E2Bd0C8829", // heco
      "0x171a9377C5013bb06Bca8CfE22B9C007f2C319F1", // polygon
      "0x5b531C46dB853fD0fDA4736AC013D7a25E8b1083",
      "0x88036021b39759Fc46aD79850679282cb2353372",
      "0x2831CF4FA295A1F86D24CCE941b3a8d45Dd9F969",
      "0x47e0fb3B4AD7cB0212E09960AbF8376f2eaa60b6",
      "0xd9B4aE62721d6311d67566A32E75f9002447922e",
      "0x9F64f55E5bA75eC6E05684A9D005Aa0640d4A653",
      "0xC8176C4C7B3dd8165554f82eFd8184eA8950DE31",
    ],
    nativeToken: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  },
  arbitrum: {
    routers: [
      "0x650Af55D5877F289837c30b94af91538a7504b76",
      "0x0caE51e1032e8461f4806e26332c030E34De3aDb",
      "0xC931f61B1534EB21D8c11B24f3f5Ab2471d4aB50",
    ],
    EOAs: ["0x5Daa0020441e3546652937C110425DCA61dE9a56"],
    nativeToken: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  },
  optimism: {
    routers: ["0xDC42728B0eA910349ed3c6e1c9Dc06b5FB591f98"],
    nativeToken: "0x4200000000000000000000000000000000000006",
  },
} as {
  [chain: string]: {
    routers?: string[];
    EOAs?: string[];
    nativeToken?: string;
  };
}; // fix

const nativeTokenTransferSignatures = {
  ethereum: ["0x535741", "0x"],
  fantom: ["0x535741", "0x"],
  bsc: ["0x535741", "0x"],
  polygon: ["0x535741", "0x"],
  avax: ["0x535741", "0x"],
  arbitrum: ["0x535741", "0x"],
  optimism: ["0x535741", "0x"],
} as { [chain: string]: string[] };

const routerWithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "LogAnySwapIn(bytes32,address,address,uint256,uint256,uint256)",
  abi: [
    "event LogAnySwapIn(bytes32 indexed txhash, address indexed token, address indexed to, uint256 amount, uint256 fromChainID, uint256 toChainID)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "token",
    amount: "amount",
    to: "to",
  },
  fixedEventData: {
    from: "",
  },
  isDeposit: false,
};

const routerDepositParams: PartialContractEventParams = {
  target: "",
  topic: "LogAnySwapOut(address,address,address,uint256,uint256,uint256)",
  abi: [
    "event LogAnySwapOut(address indexed token, address indexed from, address indexed to, uint256 amount, uint256 fromChainID, uint256 toChainID)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    token: "token",
    amount: "amount",
    from: "from",
  },
  fixedEventData: {
    to: "",
  },
  isDeposit: true,
};

const constructParams = (chain: string) => {
  let eventParams = [] as any;
  const chainAddresses = contractAddresses[chain];
  const routers = chainAddresses.routers;
  const EOAs = chainAddresses.EOAs;
  if (routers) {
    routers.map((address: string) => {
      const finalRouterWithdrawalParams = {
        ...routerWithdrawalParams,
        target: address,
        fixedEventData: {
          from: address,
        },
      };
      const finalRouterDepositParams = {
        ...routerDepositParams,
        target: address,
        fixedEventData: {
          to: address,
        },
      };
      eventParams.push(finalRouterWithdrawalParams, finalRouterDepositParams);
    });
  }
  if (EOAs) {
    // for ERC transfers
    EOAs.map((address: string) => {
      const transferWithdrawalParams = constructTransferParams(address, false);
      const transferDepositParams = constructTransferParams(address, true);
      eventParams.push(transferWithdrawalParams, transferDepositParams);
    });
  }
  return async (fromBlock: number, toBlock: number) => {
    const eventLogData = (await getTxDataFromEVMEventLogs(
      "multichain",
      chain as Chain,
      fromBlock,
      toBlock,
      eventParams
    )) as EventData[];

    let nativeTokenData = [] as EventData[];
    // for native token transfers
    const nativeToken = chainAddresses.nativeToken;
    const signatures = nativeTokenTransferSignatures[chain];
    if (!nativeToken) {
      throw new Error(`Chain ${chain} is missing native token address.`);
    }
    if (EOAs) {
      setTimer()
      await Promise.all(
        EOAs.map(async (address) => {
          await getEtherscanLock()
          const txs = await getTxsBlockRangeEtherscan(chain, address, fromBlock, toBlock, signatures);
          if (txs.length) {
            const hashes = txs.map((tx: any) => tx.hash);
            const nativeTokenTransfers = await getNativeTokenTransfersFromHash(
              chain as Chain,
              hashes,
              address,
              nativeToken,
            );
            nativeTokenData = [...nativeTokenTransfers, ...nativeTokenData];
          }
        })
      );
      return [...eventLogData, ...nativeTokenData];
    }

    return eventLogData;
  };
};

const adapter: BridgeAdapter = {
  //ethereum: constructParams("ethereum"),
  //polygon: constructParams("polygon"),
  //fantom: constructParams("fantom"),
  //avalanche: constructParams("avax"),
  bsc: constructParams("bsc"),
  //arbitrum: constructParams("arbitrum"),
  //optimism: constructParams("optimism"),
};

export default adapter;
