import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { ethers } from "ethers";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructTransferParams } from "../../helpers/eventParams";

const binancePegTokens = [
  "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", // ETH
  "0x55d398326f99059fF775485246999027B3197955", // USDT
  "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC
  "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", // BUSD
  "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE", // XRP
  "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47", // ADA
  "0xbA2aE424d960c26247Dd6c32edC70B295c744C43", // DOGE
  "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402", // DOT
  "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", // DAI
  "0x2859e4544C4bB03966803b044A93563Bd2D0DD4D", // SHIB
  "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94", // LTC
  "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1", // UNI
  "0x1CE0c2827e2eF14D5C4f29a091d735A204794041", // AVAX
  "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD", // LINK
  "0x0Eb3a705fc54725037CC9e008bDede697f62F335", // ATOM
  "0x8595F9dA7b868b1822194fAEd312235E43007b49", // BTT
  "0x3d6545b08693daE087E957cb1180ee38B9e3c25E", // ETC
  "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf", // BCH
  "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153", // FIL
  "0x1Fa4a73a3F0133f0025378af00236f3aBDEE5D63", // NEAR
  "0xC943c5320B9c18C153d1e2d12cC3074bebfb31A2", // FLOW
  "0xbF7c81FFF98BbE61B40Ed186e4AfD6DDd01337fe", // EGLD
  "0x56b6fB708fC5732DEC1Afc8D8556423A2EDcCbD6", // EOS
  "0xb3c11196A4f3b1da7c23d9FB0A3dDE9c6340934F", // USDP
  "0xb7F8Cd00C5A06c0537E2aBfF0b58033d02e5E094", // PAX
  "0x16939ef78684453bfDFb47825F8a5F714f12623a", // XTZ
  "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", // BTCB
  "0x14016E85a25aeb13065688cAFB43044C2ef86784", // TUSD
  "0xfb6115445Bff7b52FeB98650C87f44907E58f802", // AAVE
  "0x715D400F88C167884bbCc41C5FeA407ed4D2f8A0", // AXS
  "0x9Ac983826058b8a9C7Aa1C9171441191232E8404", // SNX
  "0x1Ba42e5193dfA8B03D15dd1B86a3113bbBEF8Eeb", // ZEC
  "0x0Ef2e7602adD1733Bfdb17aC3094d0421B502cA3", // XEC
  "0x7950865a9140cB519342433146Ed5b40c6F210f7", // PAXG
  "0x101d82428437127bF1608F699CD651e6Abf9766E", // BAT
  "0x52CE071Bd9b1C4B00A0b92D298c512478CaD67e8", // COMP
  "0x88f1A5ae2A3BF98AEAF342D26B30a79438c9142e", // YFI
  "0x9678E42ceBEb63F23197D726B29b1CB20d0064E5", // IOTX
  "0xFd7B3A77848f1C2D67E05E54d78d174a0C850335", // ONT
  "0x1fC9004eC7E5722891f5f38baE7678efCB11d34D", // NFT
  "0xfe56d5892BDffC7BF58f2E84BE1b2C32D21C308b", // KNC
  "0x070a08BeEF8d36734dD67A491202fF35a6A16d97", // SLP
  "0x7F70642d88cf1C4a3a7abb072B53B929b653edA5", // YFII
  "0xAdBAF88B39D37Dc68775eD1541F1bf83A5A45feB", // COTI
  "0x0112e557d400474717056C4e6D40eDD846F38351", // PHA
  "0x8dA443F84fEA710266C8eB6bC34B71702d033EF2", // CTSI
  "0xA069008A669e2Af00a86673D9D584cfb524A42Cc", // BNT
  "0xa3f020a5C92e15be13CAF0Ee5C95cF79585EeCC9", // ELF
  "0x1f9f6a696C6Fd109cD3956F45dC709d2b3902163", // CELR
  "0xAD6cAEb32CD2c308980a548bD0Bc5AA4306c6c18", // BAND
  "0x0856978F7fFff0a2471B4520E3521c4B3343e36f", // IDEX
  "0x2003f7ba57Ea956B05B85C60B4B2Ceea9b111256", // KMD
  "0xBc5609612b7C44BEf426De600B5fd1379DB2EcF1", // PSG
  "0x4A9A2b2b04549C3927dd2c9668A5eF3fCA473623", // DF
  "0xF78D2e7936F5Fe18308A3B2951A93b6c4a41F5e2", // OM
  "0xC40C9A843E1c6D01b7578284a9028854f6683b1B", // JUV
  "0x25E9d05365c867E59C1904E7463Af9F312296f9E", // ATM
  "0x80D5f92C2c8C682070C95495313dDB680B267320", // ASR
  "0x1bA8D3C4c219B124d351F603060663BD1bcd9bbF", // TORN
  "0xf05E45aD22150677a017Fbd94b84fBB63dc9b44c", // OG
  "0xCA0a9Df6a8cAD800046C1DDc5755810718b65C44", // TCT
  "0xd5d0322b6bAb6a762C79f8c81A0B674778E13aeD", // FIRO
  "0xD475c9c934DCD6d5f1cAC530585aa5ba14185b92", // BCHA
  "0x4F114423a2c30CD711CF8A95e46d69BF76771241", // CGAME
  "0x947950BcC74888a40Ffa2593C5798F11Fc9124C4", // SUSHI
  "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B", // BETH
];

const binanceBurnWallet = "0xF68a4b64162906efF0fF6aE34E2bB1Cd42FEf62d";
const nullAddress = "0x0000000000000000000000000000000000000000";

const mintParams: PartialContractEventParams = {
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
  isDeposit: false,
};

const constructParams = () => {
  let eventParams = [] as any;

  const burnParams = constructTransferParams(
    binanceBurnWallet,
    false,
    { includeTo: [nullAddress] },
    { includeSignatures: ["0x42966c"] }
  );

  binancePegTokens.map((token) => {
    const finalMintParams = {
      ...mintParams,
      target: token,
      fixedEventData: {
        token: token,
        from: token
      }
    }
    eventParams.push(finalMintParams)
  })

  return async (fromBlock: number, toBlock: number) => {
  const mintTxs = await getTxDataFromEVMEventLogs("binancepeg", "bsc", fromBlock, toBlock, eventParams);
  const burnTxs = await getTxDataFromEVMEventLogs("binancepeg", "bsc", fromBlock, toBlock, [burnParams]);
  const fixedBurnTxs = burnTxs.map((tx) => {
    return {
      ...tx,
      isDeposit: true
    }
  })
  return [...mintTxs, ...fixedBurnTxs]
  }
};

const adapter: BridgeAdapter = {
  bsc: constructParams(),
};

export default adapter;
