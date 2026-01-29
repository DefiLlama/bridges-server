import { Chain } from "@defillama/sdk/build/general";
import { BigNumber } from 'ethers';

import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { getTronLogs, tronGetTimestampByBlockNumber } from "../../helpers/tron";
import { EventData } from "../../utils/types";

/*
Mapo / Eth / Bsc / Matic / Klaytn / Conflux / Merlin / Blast / Base / AINN /
Optimism / Arbitrum / Linea / Scroll / Mantle
Router  V3.0:   0xEE030ec6F4307411607E55aCD08e628Ae6655B86
MOS v3.1 :      0x0000317Bec33Af037b5fAb2028f52d14658F6A56
 */
const contractAddresses_ = {
  bsc: {
    mosContract: "0xfeB2b97e4Efce787c08086dC16Ab69E063911380",
    tokens: {
      USDT: "0x55d398326f99059fF775485246999027B3197955",
      USDC: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
      DAI: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
      ETH: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
      MAP: "0x8105ECe4ce08B6B6449539A5db23e23b973DfA8f"
    }
  },
  polygon: {
    mosContract: "0xfeB2b97e4Efce787c08086dC16Ab69E063911380",
    tokens: {
      USDT: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
      USDC: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
      DAI: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
      ETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      MAP: "0xBAbceE78586d3e9E80E0d69601A17f983663Ba6a"
    }
  },
  ethereum: {
    mosContract: "0xfeB2b97e4Efce787c08086dC16Ab69E063911380",
    tokens: {
      USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      ETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      MAP: "0x9e976f211daea0d652912ab99b0dc21a7fd728e4"
    }
  },
  map: {
    mosContract: "0xfeB2b97e4Efce787c08086dC16Ab69E063911380",
    tokens: {
      USDT: "0x33daba9618a75a7aff103e53afe530fbacf4a3dd",
      USDC: "0x9f722b2cb30093f766221fd0d37964949ed66918",
      DAI: "0xEdDfAac857cb94aE8A0347e2b1b06f21AA1AAeFA",
      ETH: "0x05ab928d446d8ce6761e368c8e7be03c3168a9ec",
      MAP: "0x13cb04d4a5dfb6398fc5ab005a6c84337256ee23"
    }
  }
} as {
  [chain: string]: {
    mosContract: string;
    tokens: {};
  };
};
const contractAddresses = {
  ethereum: {
    mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
    tokens: {
      USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      ETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      MAP: "0x9e976f211daea0d652912ab99b0dc21a7fd728e4",
      BTC: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",//WBTC
    }
  },
  bsc: {
    mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
    tokens: {
      USDT: "0x55d398326f99059fF775485246999027B3197955",
      USDC: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
      DAI: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
      ETH: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
      MAP: "0x8105ECe4ce08B6B6449539A5db23e23b973DfA8f",
      BTC: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",//BTCB
    }
  },
  polygon: {
    mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
    tokens: {
      USDT: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
      USDC: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
      DAI: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
      ETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      MAP: "0xBAbceE78586d3e9E80E0d69601A17f983663Ba6a"
    }
  },
  arbitrum: {
    mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
    tokens: {
      USDT: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
      USDC: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
      ETH: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      BTC: "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
    }
  },
  base: {
    mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
    tokens: {
      USDT: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
      USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      ETH: "0x4200000000000000000000000000000000000006",
      BTC: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c",
    }
  },
  optimism: {
    mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
    tokens: {
      USDT: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
      USDC: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
      ETH: "0x4200000000000000000000000000000000000006",
      BTC: "0x68f180fcCe6836688e9084f035309E29Bf0A2095",
    }
  },

  linea: {
    mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
    tokens: {
      USDT: "0xA219439258ca9da29E9Cc4cE5596924745e12B93",
      USDC: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff",
      ETH: "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f",
    }
  },
  mantle: {
    mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
    tokens: {
      USDT: "0x201eba5cc46d216ce6dc03f6a759e8e766e956ae",
      USDC: "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9",
      ETH: "0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111"
    }
  },
  xlayer: {
    mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
    tokens: {
      USDT: "0x1e4a5963abfd975d8c9021ce480b42188849d41d",
      USDC: "0x74b7f16337b8972027f6196a17a631ac6de26d22",
      ETH: "0x5a77f1443d16ee5761d310e38b62f77f726bc71c",
      BTC: "0xea034fb02eb1808c2cc3adbc15f447b93cbe08e1",
      OKB: "0xe538905cf8410324e03a5a23c1c177a474d59b2b",
    }
  },

  klaytn: {
    mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
    tokens: {
      USDT: "0xd077a400968890eacc75cdc901f0356c943e4fdb",
      USDC: "0x608792deb376cce1c9fa4d0e6b7b44f507cffa6a",
      ETH: "0x98a8345bb9d3dda9d808ca1c9142a28f6b0430e1",
    }
  },
  blast: {
    mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
    tokens: {
      ETH: "0x4300000000000000000000000000000000000004",
    }
  },

  // map: {
  //   mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
  //   tokens: {
  //     USDT: "0x33daba9618a75a7aff103e53afe530fbacf4a3dd",
  //     USDC: "0x9f722b2cb30093f766221fd0d37964949ed66918",
  //     ETH: "0x05ab928d446d8ce6761e368c8e7be03c3168a9ec",
  //     MAP: "0x13cb04d4a5dfb6398fc5ab005a6c84337256ee23",
  //     BTC: '0xb877e3562a660c7861117c2f1361a26abaf19beb',
  //     TRX: '0x593a37fe0f6dfd0b6c5a051e9a44aa0f6922a1a2',
  //   }
  // },
  merlin: {
    mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
    tokens: {
      WBTC: "0xF6D226f9Dc15d9bB51182815b320D3fBE324e1bA",
      WBTC_1: "0xB880fd278198bd590252621d4CD071b1842E9Bcd",
      sBTC: "0x41D9036454BE47d3745A823C4aaCD0e29cFB0f71",
      iUSD: "0x0A3BB08b3a15A19b4De82F8AcFc862606FB69A2D"
    }
  },
  scroll: {
    mosContract: "0x0000317Bec33Af037b5fAb2028f52d14658F6A56",
    tokens: {
      USDT: "0xf55bec9cafdbe8730f096aa55dad6d22d44099df",
      USDC: "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4",
      WETH: "0x5300000000000000000000000000000000000004",
    }
  },

  tron: {
    mosContract: "TXsDYB9ovFEFg4cja6gn1t1tpmrnSbYhHA",
    tokens: {
      // TRX: "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb",
      USDC: "TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8",
      USDT: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
      // ETH: "THb4CqiFdwNHsWsQCs4JhzwjMWys4aqCbF",
      // BTC: "TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9",
    }
  },

} as {
  [chain: string]: {
    mosContract: string;
    tokens: {};
  };
};

const tokenDepositParams: PartialContractEventParams = {
  target: "",
  topic: "mapSwapIn(uint256,uint256,bytes32,address,bytes,address,uint256)",
  abi: [
    "event mapSwapIn(uint256 indexed fromChain, uint256 indexed toChain, bytes32 indexed orderId, address token, bytes from, address toAddress, uint256 amountOut)"
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash"
  },
  argKeys: {
    from: "from",
    to: "toAddress",
    token: "token",
    amount: "amountOut"
  },
  isDeposit: true,
};

const tokenWithdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "mapSwapOut(uint256,uint256,bytes32,bytes,bytes,bytes,uint256,bytes)",
  abi: ["event mapSwapOut(uint256 indexed fromChain, uint256 indexed toChain, bytes32 orderId, bytes token, bytes from, bytes to, uint256 amount, bytes swapData)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash"
  },
  argKeys: {
    to: "to",
    amount: "amount"
  },
  isDeposit: false
};

const constructParams_ = (chain: string) => {

  const chainAddresses = contractAddresses[chain]
  const mos = chainAddresses.mosContract;
  const tokens = chainAddresses.tokens;

  if (chain === "tron"){
    return async (fromBlock: number, toBlock: number) => {
      if (!mos) {
        // No portal address found for Tron
        return [];
      }

      try {
        // Convert block numbers to timestamps for Tron API
        const fromTimestamp = await tronGetTimestampByBlockNumber(fromBlock);
        const toTimestamp = await tronGetTimestampByBlockNumber(toBlock);

        // Define event names - same as EVM chains
        const eventNames = [
          "mapSwapIn",
          "mapSwapOut",
        ];

        let allEvents: EventData[] = [];

        // Process each event type
        for (const eventName of eventNames) {
          try {
            const logs = await getTronLogs(mos, eventName, fromTimestamp, toTimestamp);

          if (logs.length === 0) {
            continue;
          }

            // Process logs into EventData format
            const processedEvents = logs.map(log => {
              // Determine if this is a deposit event
              const isDeposit = eventName === "UserLockLogger";

              // Extract common fields
              const event: any = {
                blockNumber: log.block_number,
                txHash: log.transaction_id,
                isDeposit,
                // Initialize required EventData fields
                from: '',
                to: '',
                token: '',
                amount: '0',
              };

              // Extract specific fields based on event type
              if (eventName === "UserLockLogger" || eventName === "UserBurnLogger") {
                // For deposit events (UserLockLogger, UserBurnLogger)
                if (log.result) {
                  event.from = log.result.userAccount;
                  event.amount = log.result.value;
                  event.token = log.result.tokenAccount;
                }
              } else {
                // For withdrawal events (SmgReleaseLogger, SmgMintLogger)
                if (log.result) {
                  event.to = log.result.userAccount;
                  event.amount = log.result.value;
                  event.token = log.result.tokenAccount;
                }
              }

              return event;
            });

            allEvents = [...allEvents, ...processedEvents];
          } catch (error) {
            console.error(`Error processing Tron ${eventName} events:`, error);
          }
        }

        return allEvents;
      } catch (error) {
        console.error(`Error processing Tron events:`, error);
        return [];
      }
    };

  }

  // const finalMOSDepositParams = {
  //   ...tokenDepositParams,
  //   target: mos,
  //   fixedEventData: {
  //     to: mos
  //   }
  // };
  // const finalMOSWithdrawalParams = {
  //   ...tokenWithdrawalParams,
  //   target: mos,
  //   fixedEventData: {
  //     from: mos
  //   }
  // };
  // eventParams.push(finalMOSDepositParams, finalMOSWithdrawalParams);
  const eventParams = [] as any;
  for (let token of Object.values(tokens)) {
    const finalTokenDepositParams = {
      ...tokenDepositParams,
      target: mos,
      fixedEventData: {
        to: mos,
        token: token
      }
    };
    const finalTokenWithdrawalParams = {
      ...tokenWithdrawalParams,
      target: mos,
      fixedEventData: {
        from: mos,
        token: token
      }
    };
    eventParams.push(finalTokenDepositParams, finalTokenWithdrawalParams);
  }


  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("butternetwork", chain as Chain, fromBlock, toBlock, eventParams);
};
const constructParams = (chain: string) => {

  if (chain === "tron"){
    return constructTronParams();
  }
  const chainAddresses = contractAddresses[chain]
  const contractAddress = chainAddresses.mosContract;
  const tokens = chainAddresses.tokens;

  let eventParams = [] as PartialContractEventParams[];
  const depositParams = constructTransferParams(contractAddress, true, {
    excludeFrom: [contractAddress],
  });
  const withdrawalParams = constructTransferParams(contractAddress, false, {
    excludeTo: [contractAddress],
  });
  eventParams.push(depositParams, withdrawalParams);
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("butternetwork", chain as Chain, fromBlock, toBlock, eventParams);
};
const constructTronParams = () => {

  return async (fromBlock: number, toBlock: number) => {
    const chainAddresses = contractAddresses['tron']
    const mos = chainAddresses.mosContract;
    const tokens = chainAddresses.tokens;
    // console.log('Tron',fromBlock,toBlock,mos);
    if (!mos) {
      // No mos address found for Tron
      return [];
    }

    try {
      // Convert block numbers to timestamps for Tron API
      const fromTimestamp = await tronGetTimestampByBlockNumber(fromBlock);
      const toTimestamp = await tronGetTimestampByBlockNumber(toBlock);

      // Define event names - same as EVM chains
      // const eventNames = [
      //   "Transfer",
      //   // "MessageIn",
      // ];
      const eventName = 'Transfer';

      let allEvents: EventData[] = [];

      // Process each event type
      for (const symbol in tokens) {
        try {
          const address = (tokens as any)[symbol];
          // console.log('Tron',`Get [${symbol}]`,fromBlock,toBlock);
          // const logs = await getTronLogs(mos, eventName, fromTimestamp, toTimestamp);
          const logs = await getTronLogs(address, eventName, fromTimestamp, toTimestamp);

          if (logs.length === 0) {
            continue;
          }

          // Process logs into EventData format
          const processedEvents = logs.map(log => {
            // console.log(log);

            if (!log.result){
              return null;
            }
            const mosEvmAddress='0xf030b8253704c2230c2cf4fb5523b410f66ff75c';
            // Determine if this is a deposit event
            const isDeposit = log.result.to === mosEvmAddress;
            // Extract common fields
            const event: any = {
              blockNumber: log.block_number,
              txHash: log.transaction_id,
              isDeposit,
              // Initialize required EventData fields
              from: '',
              to: '',
              token: '',
              amount: '0',
            };
            if (log.result.from === mosEvmAddress){
              event.from = log.result.from;
              event.amount = BigNumber.from(log.result.value);
              event.token = log.contract_address;
            }else if (log.result.to === mosEvmAddress){
              event.to = log.result.to;
              event.amount = log.result.value;
              event.amount = BigNumber.from(log.result.value);
              event.token = log.contract_address;
            }else {
              return null;
            }
            return event;
            // return null;
          }).filter(it=>it!=null);

          allEvents = [...allEvents, ...processedEvents];
        } catch (error) {
          console.error(`Error processing Tron ${eventName} events:`, error);
        }
      }

      return allEvents;
    } catch (error) {
      console.error(`Error processing Tron events:`, error);
      return [];
    }
  };

};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  bsc: constructParams("bsc"),
  polygon: constructParams("polygon"),
  arbitrum: constructParams("arbitrum"),
  base: constructParams("base"),
  optimism: constructParams("optimism"),
  tron: constructParams("tron"),
  // 'map relay chain': constructParams("map"),
  xlayer: constructParams("xlayer"),
  klaytn: constructParams("klaytn"),
  linea: constructParams("linea"),

  mantle: constructParams("mantle"),
  blast: constructParams("blast"),
  merlin: constructParams("merlin"),
  scroll: constructParams("scroll"),
};

export default adapter;
