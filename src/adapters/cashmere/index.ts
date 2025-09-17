import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

/*
Cashmere Bridge CCTP Relayer - On-chain Event-based Implementation
- Tracks CashmereTransfer events (deposits)
- Tracks MintAndWithdraw events (withdrawals)
- Much faster than API-based approach
*/

type Address = `0x${string}`;

interface Deployment {
  cashmereContract: Address;
  tokenMessengerV1: Address;
  tokenMessengerV2: Address;
  usdc: Address;
  domain: number;
}

// Mainnet contract deployments
const deployments = {
  ethereum: {
    cashmereContract: "0xD156fFB54871F4562744d6Be5d6321B5BffCa3B6",
    tokenMessengerV1: "0xBd3fa81B58Ba92a82136038B25aDec7066af3155",
    tokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    domain: 0,
  },
  avax: {
    cashmereContract: "0xD156fFB54871F4562744d6Be5d6321B5BffCa3B6", 
    tokenMessengerV1: "0x6B25532e1060CE10cc3B0A99e5683b91BFDe6982",
    tokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    usdc: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    domain: 1,
  },
  optimism: {
    cashmereContract: "0xD156fFB54871F4562744d6Be5d6321B5BffCa3B6",
    tokenMessengerV1: "0x2B4069517957735bE00ceE0fadAE88a26365528f",
    tokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    usdc: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    domain: 2,
  },
  arbitrum: {
    cashmereContract: "0x3412ef459221d1581a08dcD56Ee55B8FaeBf5eEA",
    tokenMessengerV1: "0x19330d10D9Cc8751218eaf51E8885D058642E08A",
    tokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    domain: 3,
  },
  base: {
    cashmereContract: "0xD156fFB54871F4562744d6Be5d6321B5BffCa3B6",
    tokenMessengerV1: "0x1682Ae6375C4E4A97e4B583BC394c861A46D8962",
    tokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    domain: 6,
  },
  polygon: {
    cashmereContract: "0xD156fFB54871F4562744d6Be5d6321B5BffCa3B6",
    tokenMessengerV1: "0x9daF8c91AEFAE50b9c0E69629D3F6Ca40cA3B3FE",
    tokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    usdc: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    domain: 7,
  },
  unichain: {
    cashmereContract: "0xd002a7172Ac6f90657FCb918B3f7e36372a4bA80",
    tokenMessengerV1: "0x4e744b28E787c3aD0e810eD65A24461D4ac5a762",
    tokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    usdc: "0x078D782b760474a361dDA0AF3839290b0EF57AD6",
    domain: 10,
  },
  linea: {
    cashmereContract: "0xD156fFB54871F4562744d6Be5d6321B5BffCa3B6",
    tokenMessengerV1: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d", // Same for V1 and V2 (newer chain)
    tokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    usdc: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff",
    domain: 11,
  },
  sonic: {
    cashmereContract: "0xD156fFB54871F4562744d6Be5d6321B5BffCa3B6",
    tokenMessengerV1: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d", // Same for V1 and V2 (newer chain)
    tokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    usdc: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
    domain: 13,
  },
  wc: {
    cashmereContract: "0xD156fFB54871F4562744d6Be5d6321B5BffCa3B6",
    tokenMessengerV1: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d", // Same for V1 and V2 (newer chain)
    tokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    usdc: "0x79A02482A880bCe3F13E09da970dC34dB4cD24D1",
    domain: 14,
  },
  sei: {
    cashmereContract: "0xD156fFB54871F4562744d6Be5d6321B5BffCa3B6",
    tokenMessengerV1: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d", // Same for V1 and V2 (newer chain)
    tokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    usdc: "0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392",
    domain: 16,
  },
  hyperliquid: {
    cashmereContract: "0x15b2810232ec96ff083ca6d8b785cb930d241d83", // HyperEVM
    tokenMessengerV1: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d", // Same for V1 and V2 (newer chain)
    tokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    usdc: "0xb88339CB7199b77E23DB6E890353E22632Ba630f",
    domain: 19,
  },
} satisfies Record<Chain, Deployment>;

// Deposit event: CashmereTransfer from our contracts
const depositParams = {
  topic: "CashmereTransfer(uint32,uint256,bytes32,bytes32,address,uint64,uint256,bool)",
  abi: [
    "event CashmereTransfer(uint32 destinationDomain, uint256 indexed nonce, bytes32 recipient, bytes32 solanaOwner, address indexed user, uint64 amount, uint256 gasDropAmount, bool isNative)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "user",        // The sender address
    amount: "amount",    // USDC amount (6 decimals)
  },
  isDeposit: true,
} satisfies Partial<PartialContractEventParams>;

// Withdrawal events: MintAndWithdraw from Circle's Message Transmitter (V1 and V2)

// V1 Message Transmitter withdrawal event (3 parameters)
const withdrawalParamsV1 = {
  topic: "MintAndWithdraw(address,uint256,address)",
  abi: [
    "event MintAndWithdraw(address indexed mintRecipient, uint256 amount, address indexed mintToken)",
  ],
  logKeys: {
    blockNumber: "blockNumber", 
    txHash: "transactionHash",
  },
  argKeys: {
    to: "mintRecipient",  // The recipient address
    amount: "amount",     // USDC amount (6 decimals)
    token: "mintToken",   // USDC token address
  },
  isDeposit: false,
} satisfies Partial<PartialContractEventParams>;

// V2 Message Transmitter withdrawal event (4 parameters)
const withdrawalParamsV2 = {
  topic: "MintAndWithdraw(address,uint256,address,uint256)",
  abi: [
    "event MintAndWithdraw(address indexed mintRecipient, uint256 amount, address indexed mintToken, uint256 feeCollected)",
  ],
  logKeys: {
    blockNumber: "blockNumber", 
    txHash: "transactionHash",
  },
  argKeys: {
    to: "mintRecipient",  // The recipient address
    amount: "amount",     // USDC amount (6 decimals)
    token: "mintToken",   // USDC token address
  },
  isDeposit: false,
} satisfies Partial<PartialContractEventParams>;

const constructParams = (chain: keyof typeof deployments) => {
  const deployment = deployments[chain];
  
  const eventParams = [
    // Deposit events from our Cashmere contract
    {
      ...depositParams,
      target: deployment.cashmereContract,
      fixedEventData: {
        token: deployment.usdc,
        to: deployment.usdc, // Will be overridden by recipient from event
      },
    },
    // V1 Withdrawal events from Circle's Token Messenger V1 (CORRECT!)
    {
      ...withdrawalParamsV1,
      target: deployment.tokenMessengerV1,
      fixedEventData: {
        from: deployment.tokenMessengerV1, // Token Messenger as source
      },
    },
    // V2 Withdrawal events from Circle's Token Messenger V2 (CORRECT!)
    {
      ...withdrawalParamsV2,
      target: deployment.tokenMessengerV2,
      fixedEventData: {
        from: deployment.tokenMessengerV2, // Token Messenger as source
      },
    },
  ];

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("cashmere", chain, fromBlock, toBlock, eventParams);
};

// Create adapter for all supported EVM chains
const adapter: BridgeAdapter = Object.fromEntries(
  (Object.keys(deployments) as Array<keyof typeof deployments>).map(chain => [
    chain, // Use the chain names as they are (avax, world_chain already correct)
    constructParams(chain)
  ])
);

export default adapter;
