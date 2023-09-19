import { ethers } from "ethers";

export const gatewayAddresses = {
  ethereum: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
  bsc: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
  polygon: "0x6f015F16De9fC8791b234eF68D486d2bF203FBA8",
  avax: "0x5029C0EFf6C34351a0CEc334542cDb22c7928f78",
  fantom: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
  arbitrum: "0xe432150cce91c13a887f7D836923d5597adD8E31",
  optimism: "0xe432150cce91c13a887f7D836923d5597adD8E31",
  base: "0xe432150cce91c13a887f7D836923d5597adD8E31",
  linea: "0xe432150cce91c13a887f7D836923d5597adD8E31",
  moonbeam: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
  celo: "0xe432150cce91c13a887f7D836923d5597adD8E31",
  kava: "0xe432150cce91c13a887f7D836923d5597adD8E31",
  filecoin: "0xe432150cce91c13a887f7D836923d5597adD8E31",
  mantle: "0xe432150cce91c13a887f7D836923d5597adD8E31"
} as {
  [chain: string]: string;
};

// The same address for all chains
export const depositServiceAddress = "0xc1DCb196BA862B337Aa23eDA1Cb9503C0801b955";

export const withdrawParams = (from: string, to: string) => ({
  target: "",
  topic: "Transfer(address,address,uint256)",
  topics: [
    ethers.utils.id("Transfer(address,address,uint256)"),
    ethers.utils.hexZeroPad(from, 32),
    ethers.utils.hexZeroPad(to, 32),
  ],
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
  functionSignatureFilter: {
    includeSignatures: ["0x09c5ea"],
  },
  isDeposit: false,
});

export const wrapParams = (from: string, to: string) => ({
  ...withdrawParams(from, to),
  functionSignatureFilter: {
    includeSignatures: ["0xcf85fb"],
  },
  isDeposit: true,
});
