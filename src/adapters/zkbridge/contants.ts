const nativeTokens: Record<string, string> = {
    ethereum: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    arbitrum: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    optimism: "0x4200000000000000000000000000000000000006",
    base: "0x4200000000000000000000000000000000000006",
    linea: "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f",
    blast: "0x4300000000000000000000000000000000000004",
    scroll: "0x5300000000000000000000000000000000000004",
    polygon: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    bsc: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    polygon_zkevm: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    era: "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
    arbitrum_nova: "0x722E8BdD2ce80A4422E880164f2079488e115365",
    merlin: "0xF6D226f9Dc15d9bB51182815b320D3fBE324e1bA",
    opbnb: "0x4200000000000000000000000000000000000006",
    combo: "0x4200000000000000000000000000000000000006",
    bouncebit: "0xF4c20e5004C6FDCDdA920bDD491ba8C98a9c5863",
    bitlayer: "0xff204e2681a6fa0e2c3fade68a1b28fb90e4fc5f",
    mantle: "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8"
  };
  
const zkbridgeContractes = {
    ethereum: {
      "0x89a56FF41a4be1360f780c5abFBA8FD7EceD2c7A":{
        1:{
          isNativeToken:true,
          nativeToken:nativeTokens["ethereum"],
          tokenDecimal:18,
          shareDecimal:18,
        },
        3: {
          tokenAddress:"0xdAC17F958D2ee523a2206206994597C13D831ec7",
          tokenDecimal:6,
          shareDecimal:6,
        }
      },
      "0xA4252F2A68b2A078c86E0569eB7Fb872A37864AF": {
        1: {
            tokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            tokenDecimal: 6,
            shareDecimal: 6,
        },
        2: {
            tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            tokenDecimal: 6,
            shareDecimal: 6
        },
        20: {
            isNativeToken: true,
            nativeToken: nativeTokens["ethereum"],
            tokenDecimal: 18,
            shareDecimal: 18
        }
      },
      "0x04B9b6a1C41D1A7c98e5D2523460c39F4757e9A8": {
        1: {
            tokenAddress:"0xF5e11df1ebCf78b6b6D26E04FF19cD786a1e81dC",
            tokenDecimal: 18,
            shareDecimal: 18
        },
        2: {
            tokenAddress: "0x77776b40C3d75cb07ce54dEA4b2Fd1D07F865222",
            tokenDecimal: 18,
            shareDecimal: 18
        }
      },
      "0x00D38853127A2f84474353735eA3a4c3213DFF91": {
        1: {
            tokenAddress: "0xd5F7838F5C461fefF7FE49ea5ebaF7728bB0ADfa",
            tokenDecimal: 18,
            shareDecimal: 18
        },
        20: {
            tokenAddress: "0x3c3a81e81dc49A522A592e7622A7E711c06bf354",
            tokenDecimal: 20,
            shareDecimal: 20
        }
      }
    },
    bsc: {
      "0x51187757342914E7d94FFFD95cCCa4f440FE0E06": {
        1: {
          tokenAddress: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
          tokenDecimal: 18,
          shareDecimal:18
        },
        3: {
          tokenAddress: "0x55d398326f99059fF775485246999027B3197955",
          tokenDecimal: 18,
          shareDecimal: 6
        },
        10: {
          isNativeToken: true,
          nativeToken: nativeTokens["bsc"],
          tokenDecimal: 18,
          shareDecimal: 18,
        }
      },
      "0x1B60db9374EE8B9a7706B1D746259D8AFfbf4Cb9": {
        1: {
            tokenAddress: "0xF5e11df1ebCf78b6b6D26E04FF19cD786a1e81dC",
            tokenDecimal: 18,
            shareDecimal: 18,
        },
        2: {
            tokenAddress: "0x77776b40C3d75cb07ce54dEA4b2Fd1D07F865222",
            tokenDecimal: 18,
            shareDecimal: 18
        }
      },
      "0x5F9d235289da95520d683F6C0E9F495D435C0300": {
        1: {
            tokenAddress: "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11",
            tokenDecimal: 18,
            shareDecimal: 18
        }
      },
      "0xd00EE54eaCBf05c56dC5D183F6E7b3Bac5356244": {
        1: {
            tokenAddress: "0x60D01EC2D5E98Ac51C8B4cF84DfCCE98D527c747",
            tokenDecimal: 18,
            shareDecimal: 18
        }
      },
      "0x9BC19953839618bBA89f28aC4eC761d7051AF440": {
        1: {
            tokenAddress: "0xc03fBF20A586fa89C2a5f6F941458E1Fbc40c661",
            tokenDecimal: 18,
            shareDecimal: 18
        }
      }
    },
    polygon: {
      "0x104bc711530554F18936a12542192F8bd36166B1": {
        1: {
          tokenDecimal: 18,
          shareDecimal: 18,
          tokenAddress: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        },
        3: {
          tokenDecimal: 6,
          shareDecimal: 6,
          tokenAddress: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"
        }
      }
    },
    optimism: {
      "0x24bbC063DeF30Ae81AECC659B97A8b2562b2AFCd": {
        1: {
          isNativeToken: true,
          nativeToken: nativeTokens["optimism"],
          tokenDecimal: 18,
          shareDecimal: 18,
        },
        3: {
          tokenAddress: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
          tokenDecimal: 6,
          shareDecimal: 6,
        }
      }
    },
    arbitrum: {
        "0xC9D0b733AdAa1f851639cA47a9a2d8A6C8572BdB": {
            1: {
                isNativeToken: true,
                nativeToken: nativeTokens["arbitrum"],
                tokenDecimal:18,
                shareDecimal:18
            },
            3: {
                tokenAddress: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
                tokenDecimal: 6,
                shareDecimal: 6
            }
        }
    },
    linea: {
        "0x366C1B89aA0783d0886B9EF817d10c8729783dCb": {
            1: {
                isNativeToken: true,
                nativeToken: nativeTokens["linea"],
                tokenDecimal: 18,
                shareDecimal: 18
            },
            3: {
                tokenAddress: "0xA219439258ca9da29E9Cc4cE5596924745e12B93",
                tokenDecimal: 6,
                shareDecimal: 6
            }
        },
        "0xAAe504413e6745FFC111447b1688940D62570126": {
            1: {
                tokenAddress: "0x60D01EC2D5E98Ac51C8B4cF84DfCCE98D527c747",
                tokenDecimal: 18,
                shareDecimal: 18
            }
        }
    },
    mantle: {
        "0xAFC153cF66F33C492d5b638Ee90f5eBd2673e4d3": {
            1: {
                tokenAddress: "0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111",
                tokenDecimal: 18,
                shareDecimal: 18
            },
            3: {
                tokenAddress: "0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE",
                tokenDecimal: 6,
                shareDecimal: 6
            }
        },
        "0x3843C95D9f8554baffdfc0C145Ce9DfB06Cd4E24": {
            1: {
                tokenAddress: "0x60D01EC2D5E98Ac51C8B4cF84DfCCE98D527c747",
                tokenDecimal: 18,
                shareDecimal: 18
            }
        },
        "0xf926f7D15c62eC18299bA817A73A2519fCC3Bfec": {
            1: {
                tokenAddress: "0xcDA86A272531e8640cD7F1a92c01839911B90bb0",
                tokenDecimal: 18,
                shareDecimal: 18
            },
            20: {
                isNativeToken: true,
                nativeToken: nativeTokens["mantle"],
                tokenDecimal: 18,
                shareDecimal: 18
            }
        }
    },
    base: {
        "0x87A659d0433F21E257f5d252fe163E1341DdCe81": {
            1: {
                isNativeToken: true,
                nativeToken: nativeTokens["base"],
                tokenDecimal: 18,
                shareDecimal: 18,
            }
        }
    },
    "op_bnb": {
        "0x953a578c7Ce8F3A1BF625d182A8caf7181FD4BEB": {
            1: {
                tokenAddress: "0xE7798f023fC62146e8Aa1b36Da45fb70855a77Ea",
                tokenDecimal: 18,
                shareDecimal: 18,
            },
            3: {
                tokenAddress: "0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3",
                tokenDecimal: 18,
                shareDecimal: 6,
            },
            10: {
                isNativeToken: true,
                nativeToken: nativeTokens["opbnb"],
                tokenDecimal: 18,
                shareDecimal:18
            }
        },
        "0xcdBCB231639dB01BAa1dCFBbB93c3264d921E0Fc": {
            1: {
                tokenAddress:"0x9d94a7ff461e83f161c8c040e78557e31d8cba72",
                tokenDecimal: 18,
                shareDecimal: 18
            }
        }
    },
    scroll: {
        "0xe69F676b2142FA05A3DC51A0E51d68a685AE7391": {
            1: {
                isNativeToken: true,
                nativeToken: nativeTokens["scroll"],
                tokenDecimal: 18,
                shareDecimal: 18,
            },
            3: {
                tokenAddress: "0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df",
                tokenDecimal: 6,
                shareDecimal: 6,
            }
        },
        "0xb9fe89f0e2A18f3B2A0EB6A9747F1eAf0F499ff5": {
            1: {
                tokenAddress: "0x60D01EC2D5E98Ac51C8B4cF84DfCCE98D527c747",
                tokenDecimal: 18,
                shareDecimal: 18
            }
        }
    },
    "combo-mainnet": {
        "0x254010E880e04a27C98cBb8D241f8C3554d3784d": {
            3: {
                tokenAddress: "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2",
                tokenDecimal: 18,
                shareDecimal: 6
            },
            10: {
                isNativeToken: true,
                nativeToken: nativeTokens["combo"],
                tokenDecimal: 18,
                shareDecimal: 18,
            }
        },
        "0xA4121b1D357E94Fb29DF61a6EDBa118E7Ca27F05": {
            1: {
                tokenAddress: "0xD08a2917653d4E460893203471f0000826fb4034",
                tokenDecimal: 18,
                shareDecimal: 18
            }
        }
    },
    "bouncebit-mainnet": {
        "0xfbC7f3607cff8355dc5B0D3bF4f9614376389321": {
            1: {
                tokenAddress: "0xf5e11df1ebcf78b6b6d26e04ff19cd786a1e81dc",
                tokenDecimal:18,
                shareDecimal: 18,
            },
            2: {
                tokenAddress: "0x77776b40c3d75cb07ce54dea4b2fd1d07f865222",
                tokenDecimal: 18,
                shareDecimal: 18
            }
        }
    },
    "btr": {
        "0x36cAE7b6b0B68c4dDb2BBD3CDeE34fd56f948aAe": {
            1: {
                tokenAddress: "0xfe9f969faf8ad72a83b761138bf25de87eff9dd2",
                tokenDecimal: 6,
                shareDecimal: 6
            },
            2: {
                tokenAddress: "0x9827431e8b77e87c9894bd50b055d6be56be0030",
                tokenDecimal: 6,
                shareDecimal: 6
            },
            20: {
                tokenAddress: "0xef63d4e178b3180beec9b0e143e0f37f4c93f4c2",
                tokenDecimal: 18,
                shareDecimal: 18
            }
        }
    }
  } as {
    [chain: string]: {
      [address:string]: {
        [poolId:number]: {
          isNativeToken?:boolean;
          nativeToken?:string;
          tokenAddress?: string;
          tokenDecimal:number;
          shareDecimal:number;
        }
      }
    }
  }

  export default zkbridgeContractes;