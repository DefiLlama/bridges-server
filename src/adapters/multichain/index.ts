import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getEVMEventLogs } from "../../helpers/eventLogs";
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
ethereum:0x0615Dbba33Fe61a31c7eD131BDA6655Ed76748B1 to WETH
ethereum:0x22648C12acD87912EA1710357B1302c6a4154Ebc to USDT
ethereum:0x7EA2be2df7BA6E54B1A9C70676f668455E329d29 to USDC

***Polygon***
0x4f3Aff3A747fCADe12598081e80c6605A8be192F is Multichain: Router V4

maps:
polygon:0xbD83010eB60F12112908774998F65761cf9f6f9a to WETH
polygon:0xE3eeDa11f06a656FcAee19de663E84C7e61d3Cac to USDT
polygon:0xd69b31c3225728CC57ddaf9be532a4ee1620Be51 to USDC

***Fantom***
0x1ccca1ce62c62f7be95d4a67722a8fdbed6eecb4 is Multichain: Router V4

*/

const contractAddresses = {
  ethereum: {
    routers: [
      "0xBa8Da9dcF11B50B03fd5284f164Ef5cdEF910705",
      "0x6b7a87899490EcE95443e979cA9485CBE7E71522",
      "0x765277EebeCA2e31912C9946eAe1021199B39C61",
      "0xe95fD76CF16008c12FF3b3a937CB16Cd9Cc20284",
    ],
    /* these will be counted in their own adapters
    eoas: [
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
    */
  },
  polygon: {
    routers: ["0x4f3Aff3A747fCADe12598081e80c6605A8be192F"],
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
  if (chainAddresses.eoas) {
    chainAddresses.eoas.map((address: string) => {
      const transferWithdrawalParams = constructTransferParams(address, false);
      const transferDepositParams = constructTransferParams(address, true);
      eventParams.push(transferWithdrawalParams, transferDepositParams);
    });
  }
  return async (fromBlock: number, toBlock: number) =>
    getEVMEventLogs("multichain", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  //polygon: constructParams("polygon"),
};

export default adapter;
