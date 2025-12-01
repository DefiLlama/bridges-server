import { BigNumber } from "ethers";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

/*
StarkGate Bridge - Ethereum <-> Starknet

Official bridges for bridging assets between Ethereum L1 and Starknet L2

Contract Addresses:
- ETH Bridge: 0xae0Ee0A63A2cE6BaeEFFE56e7714FB4EFE48D419
- ERC20 Bridge (USDC, USDT, DAI, WBTC, etc): Various token-specific bridges

Events:
- LogDeposit: Triggered when tokens are deposited from L1 to L2
- LogMessageToL1: Triggered when tokens are withdrawn from L2(StarkNet Core) to L1
*/

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const STARKNET_CORE = "0xc662c410C0ECf747543f5bA90660f6ABeBD9C8c4";

// ETH Bridge Contract
const ethBridgeContract = "0xae0Ee0A63A2cE6BaeEFFE56e7714FB4EFE48D419";

// Token-specific ERC20 bridge contracts
const contracts = {
  eth: ethBridgeContract,
  usdc: "0xF6080D9fbEEbcd44D89aFfBFd42F098cbFf92816",
  usdt: "0xbb3400F107804DFB482565FF1Ec8D8aE66747605",
  dai: "0x9F96fE0633eE838D0298E8b8980E6716bE81388d",
  wbtc: "0x283751A21eafBFcD52297820D27C1f1963D9b5b4",
  wsteth: "0xBf67F59D2988A46FBFF7ed79A621778a3Cd3985B",
  reth: "0xcf58536D6Fab5E59B654228a5a4ed89b13A876C2",
  sfrxeth: "0xd8e8531fdd446df5298819d3bc9189a5d8948ee8",
  strk: "0xce5485cfb26914c5dce00b9baf0580364dafc7a4",
  uni: "0xf76e6bf9e2df09d0f854f045a3b724074da1236b",
  frax: "0xdc687e1e0b85cb589b2da3c47c933de9db3d1ebb",
  fxs: "0x66ba83ba3d3ad296424a2258145d9910e9e40b7c",
  lusd: "0xf3f62f23df9c1d2c7c63d9ea6b90e8d24c7e3df5",
  r: "0xb27d0dcafd63db302c155c8864886f33bd2a41e5",
  multi: "0xf5b6ee2caeb6769659f6c091d209dfdcaf3f69eb",
};

// Token addresses on Ethereum
const tokenAddresses: { [key: string]: string } = {
  usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  usdt: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  dai: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  wbtc: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  wsteth: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
  reth: "0xae78736Cd615f374D3085123A210448E74Fc6393",
  strk: "0xCa14007Eff0dB1f8135f4C25B34De49AB0d42766",
  lords: "0x686f2404e77Ab0d9070a46cdfb0B7feCDD2318b0",
  frax: "0x853d955aCEf822Db058eb8505911ED77F175b99e",
  lusd: "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0",
  sfrax: "0xA663B02CF0a4b149d2aD41910CB81e23e1c41c32",
  fxs: "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0",
};

// Deposit event for ERC20 tokens
const erc20DepositParams = (contractAddress: string, tokenAddress: string): PartialContractEventParams => ({
  target: contractAddress,
  topic: "LogDeposit(address,uint256,uint256,uint256,uint256)",
  abi: [
    "event LogDeposit(address indexed sender, uint256 amount, uint256 indexed l2Recipient, uint256 nonce, uint256 fee)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "sender",
    amount: "amount",
  },
  fixedEventData: {
    to: contractAddress,
    token: tokenAddress,
  },
  isDeposit: true,
});

// Withdrawal event for ERC20 tokens - track via LogMessageToL1 on StarkNet Core
const erc20WithdrawalParams = (
  contractAddress: string,
  tokenAddress: string
): PartialContractEventParams => ({
  target: STARKNET_CORE,
  topic: "LogMessageToL1(uint256,address,uint256[])",
  abi: [
    "event LogMessageToL1(uint256 indexed fromAddress, address indexed toAddress, uint256[] payload)"
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    to: "toAddress", // This is the actual recipient on L1
    amount: "payload",
  },
  argGetters: {
    amount: (args: any) => {
      const payload = args.payload;
      const amountLow = BigInt(payload[3].toString());
      const amountHigh = BigInt(payload[4].toString());
      const fullAmount = (amountHigh << BigInt(128)) | amountLow;
      return BigNumber.from(fullAmount.toString());
    },
  },
  fixedEventData: {
    from: STARKNET_CORE, // Withdrawals come from StarkNet Core
    token: tokenAddress,
  },
  filter: {
    includeTo: [contractAddress], // Filter for events where toAddress is the bridge contract
  },
  isDeposit: false,
});

// ETH-specific events
const ethDepositParams: PartialContractEventParams = {
  target: ethBridgeContract,
  topic: "LogDeposit(address,uint256,uint256,uint256,uint256)",
  abi: [
    "event LogDeposit(address indexed sender, uint256 amount, uint256 indexed l2Recipient, uint256 nonce, uint256 fee)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "sender",
    amount: "amount",
  },
  fixedEventData: {
    to: ethBridgeContract,
    token: WETH,
  },
  isDeposit: true,
};

const ethWithdrawalParams: PartialContractEventParams = {
  target: STARKNET_CORE,
  topic: "LogMessageToL1(uint256,address,uint256[])",
  abi: [
    "event LogMessageToL1(uint256 indexed fromAddress, address indexed toAddress, uint256[] payload)"
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    to: "toAddress",
    amount: "payload",
  },
  argGetters: {
    amount: (args: any) => {
      const payload = args.payload;
      const amountLow = BigInt(payload[3].toString());
      const amountHigh = BigInt(payload[4].toString());
      const fullAmount = (amountHigh << BigInt(128)) | amountLow;
      return BigNumber.from(fullAmount.toString());
    },
  },
  fixedEventData: {
    from: STARKNET_CORE,
    token: WETH,
  },
  filter: {
    includeTo: [ethBridgeContract],
  },
  isDeposit: false,
};


const constructParams = () => {
  const eventParams: PartialContractEventParams[] = [
    // ETH deposits and withdrawals
    ethDepositParams,
    ethWithdrawalParams,
  ];

  // Add ERC20 token deposits and withdrawals
  Object.keys(contracts).forEach((tokenKey) => {
    if (tokenKey !== "eth") {
      const contractAddress = contracts[tokenKey as keyof typeof contracts];
      const tokenAddress = tokenAddresses[tokenKey];
      if (tokenAddress) {
        eventParams.push(erc20DepositParams(contractAddress, tokenAddress));
        eventParams.push(erc20WithdrawalParams(contractAddress, tokenAddress));
      }
    }
  });

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("starkgate", "ethereum", fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams(),
};

export default adapter;
