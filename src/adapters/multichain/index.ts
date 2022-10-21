import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";

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
need to map all of them, here are some of them:
maps:
ethereum:0x0615Dbba33Fe61a31c7eD131BDA6655Ed76748B1 to WETH
ethereum:0x22648C12acD87912EA1710357B1302c6a4154Ebc to USDT
ethereum:0x7EA2be2df7BA6E54B1A9C70676f668455E329d29 to USDC

***Polygon***
0x4f3Aff3A747fCADe12598081e80c6605A8be192F is Multichain: Router V4
0x2eF4A574b72E1f555185AfA8A09c6d1A8AC4025C is Anyswap: Router V6
0xAFAace7138ab3c2BCb2DB4264F8312e1Bbb80653 is Anyswap: Router V3

maps:
polygon:0xbD83010eB60F12112908774998F65761cf9f6f9a to WETH
polygon:0xE3eeDa11f06a656FcAee19de663E84C7e61d3Cac to USDT
polygon:0xd69b31c3225728CC57ddaf9be532a4ee1620Be51 to USDC
polygon:0x21804205C744dd98fbc87898704564d5094bB167 to WMATIC

***Fantom***
0x1ccca1ce62c62f7be95d4a67722a8fdbed6eecb4 is Anyswap: Router V4
0x0B23341fA1Da0171f52aA8Ef85f3946b44d35ac0 is Anyswap: Router V6
0xf3Ce95Ec61114a4b1bFC615C16E6726015913CCC is Anyswap: Router V3

maps:
fantom:0xBDC8fd437C489Ca3c6DA3B5a336D11532a532303 to WETH
fantom:0x2823D10DA533d9Ee873FEd7B16f4A962B2B7f181 to USDT
fantom:0x95bf7E307BC1ab0BA38ae10fc27084bC36FcD605 to USDC
fantom:0x6362496bef53458b20548a35a2101214ee2be3e0 to WFTM

***Avalanche***
0x833F307aC507D47309fD8CDD1F835BeF8D702a93 is Multichain: Router V6
0x05f024C6F5a94990d32191D6f36211E3Ee33504e is Anyswap: Router V6
0xB0731d50C681C45856BFc3f7539D5f61d4bE81D8 is Anyswap: Router V4
0x9b17bAADf0f21F03e35249e0e59723F34994F806 is Anyswap: Router V3

maps:
avax:0x7D09a42045359Aa85488bC07D0ADa83E22d50017 to WETH
avax:0xeaF8190fD5042EC3144184241fd405bB1dEC59e8 to USDT
avax:0xA2f9A3323e3664B9684Fbc9fb64861DC493085df to USDC
avax:0xe2D27f06F63d98b8e11b38b5b08A75D0c8dD62B9 to WAVAX

***BSC***
0xe1d592c3322f1F714Ca11f05B6bC0eFEf1907859 is Anyswap: Router V6
0xf9736ec3926703e85C843FC972BD89A7f8E827C0 is Multichain: Router V3
0xABd380327Fe66724FFDa91A87c772FB8D00bE488 is Anyswap: Router V4

maps:
bsc:0x58340A102534080b9D3175F868aeA9f6aF986dD9 to USDC
bsc:0x6F817a0cE8F7640Add3bC0c1C2298635043c2423 to WETH ?

***Arbitrum***
0x650Af55D5877F289837c30b94af91538a7504b76 is Multichain: Router V6
0x0caE51e1032e8461f4806e26332c030E34De3aDb is Anyswap: Router V3
0xC931f61B1534EB21D8c11B24f3f5Ab2471d4aB50 is Multichain: Router V4

maps:
arbitrum:0x3405A1bd46B85c5C029483FbECf2F3E611026e45 to USDC
arbitrum:0x05e481B19129B560E921E487AdB281E70Bdba463 to USDT

***Optimism***
0xDC42728B0eA910349ed3c6e1c9Dc06b5FB591f98 is Anyswap: Router V6

maps:
optimism:0x86B3F23B6e90F5bbfac59b5b2661134Ef8Ffd255 to USDT
optimism:0xf390830DF829cf22c53c8840554B98eafC5dCBc2 to USDC
optimism:0x965f84D915a9eFa2dD81b653e3AE736555d945f4 to WETH
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
    ],
  },
  polygon: {
    routers: [
      "0x4f3Aff3A747fCADe12598081e80c6605A8be192F",
      "0x2eF4A574b72E1f555185AfA8A09c6d1A8AC4025C",
      "0xAFAace7138ab3c2BCb2DB4264F8312e1Bbb80653",
    ],
  },
  fantom: {
    routers: [
      "0x1ccca1ce62c62f7be95d4a67722a8fdbed6eecb4",
      "0x0B23341fA1Da0171f52aA8Ef85f3946b44d35ac0",
      "0xf3Ce95Ec61114a4b1bFC615C16E6726015913CCC",
    ],
  },
  avax: {
    routers: [
      "0x833F307aC507D47309fD8CDD1F835BeF8D702a93",
      "0x05f024C6F5a94990d32191D6f36211E3Ee33504e",
      "0xB0731d50C681C45856BFc3f7539D5f61d4bE81D8",
      "0x9b17bAADf0f21F03e35249e0e59723F34994F806"
    ],
  },
  bsc: {
    routers: [
      "0xe1d592c3322f1F714Ca11f05B6bC0eFEf1907859",
      "0xf9736ec3926703e85C843FC972BD89A7f8E827C0",
      "0xABd380327Fe66724FFDa91A87c772FB8D00bE488",
    ],
  },
  arbitrum: {
    routers: [
      "0x650Af55D5877F289837c30b94af91538a7504b76",
      "0x0caE51e1032e8461f4806e26332c030E34De3aDb",
      "0xC931f61B1534EB21D8c11B24f3f5Ab2471d4aB50",
    ],
  },
  optimism: {
    routers: [
      "0xDC42728B0eA910349ed3c6e1c9Dc06b5FB591f98",
    ],
  },
} as { [chain: string]: any }; // fix

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
  if (chainAddresses.routers) {
    chainAddresses.routers.map((address: string) => {
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
  if (chainAddresses.EOAs) {
    chainAddresses.EOAs.map((address: string) => {
      const transferWithdrawalParams = constructTransferParams(address, false);
      const transferDepositParams = constructTransferParams(address, true);
      eventParams.push(transferWithdrawalParams, transferDepositParams);
    });
  }
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("multichain", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  fantom: constructParams("fantom"),
  avalanche: constructParams("avax"),
  bsc: constructParams("bsc"),
  arbitrum: constructParams("arbitrum"),
  optimism: constructParams("optimism")
};

export default adapter;
