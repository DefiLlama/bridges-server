import { BridgeAdapter, ContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { getTronLogs, tronGetTimestampByBlockNumber } from "../../helpers/tron";
import { EventData } from "../../utils/types";

enum Chains {
  arbitrum = "arbitrum",
  wanchain = "wan",
  ethereum = "ethereum",
  avalanche = "avax",
  moonbeam = "moonbeam",
  moonriver = "moonriver",
  functionX = "functionx",
  telos = "telos",
  polygon = "polygon",
  okexchain = "okexchain",
  optimism = "optimism",
  xdc = "xdc",
  bsc = "bsc",
  astar = "astar",
  metis = "metis",
  horizen = "horizen",
  fantom = "fantom",
  clover = "clover",
  gather = "gth",
  tron = "tron",
  vinuchain = "vinu",
  // new EVM chains
  base = "base",
  celo = "celo",
  blast = "blast",
  linea = "linea",
  op_bnb = "op_bnb",
  era = "era",
  polygon_zkevm = "polygon_zkevm",
  xlayer = "xlayer",
  bitrock = "bitrock",
  energi = "energi",
  odyssey = "odyssey",
  songbird = "songbird",
  // new non EVM chains
  bitcoin = "bitcoin",
  doge = "doge",
  litecoin = "litecoin",
  ripple = "ripple",
  noble = "noble",
  cardano = "cardano",
  solana = "solana",
}

const contractAddresses = {
  [Chains.arbitrum]: {
    portal: "0xf7ba155556e2cd4dfe3fe26e506a14d2f4b97613",
  },
  [Chains.wanchain]: {
    portal: "0xe85b0d89cbc670733d6a40a9450d8788be13da47",
  },
  [Chains.ethereum]: {
    portal: "0xfceaaaeb8d564a9d0e71ef36f027b9d162bc334e",
  },
  [Chains.avalanche]: {
    portal: "0x74e121a34a66d54c33f3291f2cdf26b1cd037c3a",
  },
  [Chains.moonbeam]: {
    portal: "0x6372aec6263aa93eacedc994d38aa9117b6b95b5",
  },
  [Chains.moonriver]: {
    portal: "0xde1ae3c465354f01189150f3836c7c15a1d6671d",
  },
  [Chains.functionX]: {
    portal: "0xdf935552fac687123c642f589296762b632a9aaf",
  },
  [Chains.telos]: {
    portal: "0x201e5de97dfc46aace142b2009332c524c9d8d82",
  },
  [Chains.polygon]: {
    portal: "0x2216072a246a84f7b9ce0f1415dd239c9bf201ab",
  },
  [Chains.okexchain]: {
    portal: "0xf7ba155556e2cd4dfe3fe26e506a14d2f4b97613",
  },
  [Chains.optimism]: {
    portal: "0xc6ae1db6c66d909f7bfeeeb24f9adb8620bf9dbf",
  },
  [Chains.xdc]: {
    portal: "0xf7ba155556e2cd4dfe3fe26e506a14d2f4b97613",
  },
  [Chains.bsc]: {
    portal: "0xc3711bdbe7e3063bf6c22e7fed42f782ac82baee",
  },
  [Chains.astar]: {
    portal: "0x592de30bebff484b5a43a6e8e3ec1a814902e0b6",
  },
  [Chains.metis]: {
    portal: "0xc6ae1db6c66d909f7bfeeeb24f9adb8620bf9dbf",
  },
  [Chains.horizen]: {
    portal: "0x97e0883493e8bb7a119a1e36e53ee9e7a2d3ca7b",
  },
  [Chains.fantom]: {
    portal: "0xccffe9d337f3c1b16bd271d109e691246fd69ee3",
  },
  [Chains.clover]: {
    portal: "0xf7ba155556e2cd4dfe3fe26e506a14d2f4b97613",
  },
  [Chains.gather]: {
    portal: "0xc6ae1db6c66d909f7bfeeeb24f9adb8620bf9dbf",
  },
  [Chains.tron]: {
    portal: "TZ9grqg3LwBKiddGra3WGHPdddJz3tow8N",
  },
  [Chains.vinuchain]: {
    portal: "0x72ccf64ee5e2c7629ee4eee3e6ad6990289178ae",
  },
  // new EVM chains
  [Chains.base]: {
    portal: "0x2715aa7156634256ae75240c2c5543814660cd04",
  },
  [Chains.celo]: {
    portal: "0x14ca89ac9cd73b01bf71a3af3f8cf8fd224d6a1d",
  },
  [Chains.blast]: {
    portal: "0xc21e5553c8dddf2e4a93e5bedbae436d4291f603",
  },
  [Chains.linea]: {
    portal: "0xffb876bd5bee99e992cac826a04396002f5f4a65",
  },
  [Chains.op_bnb]: {
    portal: "0xd6b24d0867753082e40778addb13e462a02689de",
  },
  [Chains.era]: {
    portal: "0x102f0ce7a439d51247167d6233a0a44c3f8389a1",
  },
  [Chains.polygon_zkevm]: {
    portal: "0xb13afe3e965dcd483022b1cc3adf03eea039a754",
  },
  [Chains.xlayer]: {
    portal: "0xc21e5553c8dddf2e4a93e5bedbae436d4291f603",
  },
  [Chains.bitrock]: {
    portal: "0xc21e5553c8dddf2e4a93e5bedbae436d4291f603",
  },
  [Chains.energi]: {
    portal: "0xbe5187c2a7eb776c1caeed2c37e7599fb05000d3",
  },
  [Chains.odyssey]: {
    portal: "0xc21e5553c8dddf2e4a93e5bedbae436d4291f603",
  },
  [Chains.songbird]: {
    portal: "0xc21e5553c8dddf2e4a93e5bedbae436d4291f603",
  },
  // new non EVM chains
  [Chains.bitcoin]: {
    portal: "", // fetch from API
  },
  [Chains.doge]: {
    portal: "", // fetch from API
  },
  [Chains.litecoin]: {
    portal: "", // fetch from API
  },
  [Chains.ripple]: {
    portal: "", // fetch from API
  },
  [Chains.noble]: {
    portal: "", // fetch from API
  },
  [Chains.cardano]: {
    portal: "addr1xyw0kswupwx38ljnvq8pwpvae0x69krywdr7cffg3d84ydp9nvv84g58ykxqh90xx6j8ywgjst0dkt430w9lxgdmzncsw5rzpd",
  },
  [Chains.solana]: {
    portal: "AKXdNCG4GcTQ1knC7kno9bggHuq8MG9CCb8yQd8Nx2vL",
  },
};

const userLockPortalEventParams: ContractEventParams = {
  target: "",
  topic: "UserLockLogger(bytes32,uint256,address,uint256,uint256,bytes)",
  abi: [
    "event UserLockLogger(bytes32 indexed smgID, uint indexed tokenPairID, address indexed tokenAccount, uint value, uint contractFee, bytes userAccount)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "userAccount",
    amount: "value",
    token: "tokenAccount",
  },
  isDeposit: true,
};

const userBurnPortalEventParams: ContractEventParams = {
  target: "",
  topic: "UserBurnLogger(bytes32,uint256,address,uint256,uint256,uint,bytes)",
  abi: [
    "event UserBurnLogger(bytes32 indexed smgID, uint indexed tokenPairID, address indexed tokenAccount, uint value, uint contractFee, uint fee, bytes userAccount)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "userAccount",
    amount: "value",
    token: "tokenAccount",
  },
  isDeposit: true,
};

const smgReleasePortalEventParams: ContractEventParams = {
  target: "",
  topic: "SmgReleaseLogger(bytes32,bytes32,uint256,uint256,address,address)",
  abi: [
    "event SmgReleaseLogger(bytes32 indexed uniqueID, bytes32 indexed smgID, uint indexed tokenPairID, uint value, address tokenAccount, address userAccount)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    to: "userAccount",
    amount: "value",
    token: "tokenAccount",
  },
  isDeposit: false,
};

const smgMintPortalEventParams: ContractEventParams = {
  target: "",
  topic: "SmgMintLogger(bytes32,bytes32,uint256,uint256,address,address)",
  abi: [
    "event SmgMintLogger(bytes32 indexed uniqueID, bytes32 indexed smgID, uint indexed tokenPairID, uint value, address tokenAccount, address userAccount)",
  ],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    to: "userAccount",
    amount: "value",
    token: "tokenAccount",
  },
  isDeposit: false,
};

// Define an interface to get address data for non-EVM chains
interface LockAddressData {
  [key: string]: string;
}

let lockAddressCache: LockAddressData = {};

// Get address data for non-EVM chains
async function getLockAddress(): Promise<LockAddressData> {
  if (!lockAddressCache) {
    try {
      // Fetch address data from API
      const response = await fetch("https://bridge-api.wanchain.org/api/tvl");
      const data = await response.json();
      lockAddressCache = data.data.address;
    } catch (error) {
      console.error("Error fetching lock addresses:", error);
      // Return empty object as fallback
      return {};
    }
  }
  return lockAddressCache;
}

// Non-EVM chain name mapping
const chainsMap: Record<string, string> = {
  bitcoin: "btc",
  doge: "doge",
  litecoin: "ltc",
  ripple: "xrp",
  noble: "noble",
};

// Check if a chain is non-EVM
const isNonEVMChain = (chain: string): boolean => {
  const nonEVMChains = ['bitcoin', 'litecoin', 'doge', 'ripple', 'cardano', 'solana', 'noble'];
  return nonEVMChains.includes(chain);
};

// Check if a chain is problematic (needs to be skipped)
const isProblematicChain = (chain: string): boolean => {
  const problematicChains = ['clover', 'noble', 'xlayer', 'horizen', 'eon'];
  return problematicChains.includes(chain);
};

const constructParams = (chain: Chains) => {
  // Skip problematic chains
  if (isProblematicChain(chain)) {
    return async () => {
      // Skip problematic chain silently
      return [];
    };
  }
  
  // Special case for Tron chain
  if (chain === Chains.tron) {
    return async (fromBlock: number, toBlock: number) => {
      const { portal } = contractAddresses[chain];
      if (!portal) {
        // No portal address found for Tron
        return [];
      }
      
      try {
        // Convert block numbers to timestamps for Tron API
        const fromTimestamp = await tronGetTimestampByBlockNumber(fromBlock);
        const toTimestamp = await tronGetTimestampByBlockNumber(toBlock);
        
        // Define event names - same as EVM chains
        const eventNames = [
          "UserLockLogger",  // Corresponds to userLockPortalEventParams
          "UserBurnLogger", // Corresponds to userBurnPortalEventParams
          "SmgReleaseLogger", // Corresponds to smgReleasePortalEventParams
          "SmgMintLogger"  // Corresponds to smgMintPortalEventParams
        ];
        
        let allEvents: EventData[] = [];
        
        // Process each event type
        for (const eventName of eventNames) {
          try {
            const logs = await getTronLogs(portal, eventName, fromTimestamp, toTimestamp);
            
            if (logs.length === 0) {
              continue;
            }
            
            // Process logs into EventData format
            const processedEvents = logs.map(log => {
              // Determine if this is a deposit event
              const isDeposit = eventName === "UserLockLogger" || eventName === "UserBurnLogger";
              
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
  
  // For EVM chains, use the existing processing method
  if (!isNonEVMChain(chain)) {
    const { portal } = contractAddresses[chain];
    const eventParams: ContractEventParams[] = [
      {
        ...userLockPortalEventParams,
        target: portal,
        fixedEventData: {
          to: portal,
        },
      },
      {
        ...userBurnPortalEventParams,
        target: portal,
        fixedEventData: {
          to: portal,
        },
      },
      {
        ...smgReleasePortalEventParams,
        target: portal,
        fixedEventData: {
          from: portal,
        },
      },
      {
        ...smgMintPortalEventParams,
        target: portal,
        fixedEventData: {
          from: portal,
        },
      },
    ];
    return async (fromBlock: number, toBlock: number) =>
      getTxDataFromEVMEventLogs("wanbridge", chain, fromBlock, toBlock, eventParams);
  } else {
    // For other non-EVM chains, handle differently
    return async (fromBlock: number, toBlock: number) => {
      // Log the block range for debugging purposes
      // Processing non-EVM chain
      
      // For non-EVM chains, we need to get the lock address
      // First check if we have a local address
      const { portal } = contractAddresses[chain];
      
      if (portal) {
        // Using local portal address
        // Process non-EVM chain data using local address
        // For example: return sumTokens2({ chain, owner: portal });
      } else {
        // If no local address, try to get from API
        const lockAddresses = await getLockAddress();
        const mappedChain = chainsMap[chain] || chain;
        
        if (lockAddresses[mappedChain]) {
          // Using API lock address
          // Use address from API to process non-EVM chain data
          // For example: return sumTokens2({ chain, owner: lockAddresses[mappedChain] });
        } else {
          // No lock address found in API
        }
      }
      
      // Temporarily return empty array, actual project needs to implement data retrieval for non-EVM chains
      return [];
    };
  }
};

const adapter: BridgeAdapter = {
  // Existing EVM chains
  arbitrum: constructParams(Chains.arbitrum),
  polygon: constructParams(Chains.polygon),
  bsc: constructParams(Chains.bsc),
  ethereum: constructParams(Chains.ethereum),
  avalanche: constructParams(Chains.avalanche),
  optimism: constructParams(Chains.optimism),
  fantom: constructParams(Chains.fantom),
  moonbeam: constructParams(Chains.moonbeam),
  moonriver: constructParams(Chains.moonriver),
  telos: constructParams(Chains.telos),
  okexchain: constructParams(Chains.okexchain),
  xdc: constructParams(Chains.xdc),
  astar: constructParams(Chains.astar),
  metis: constructParams(Chains.metis),
  wanchain: constructParams(Chains.wanchain),
  vinuchain: constructParams(Chains.vinuchain),
  functionx: constructParams(Chains.functionX),
  horizen: constructParams(Chains.horizen),
  clv: constructParams(Chains.clover),
  gather: constructParams(Chains.gather),

  // new EVM chains
  base: constructParams(Chains.base),
  celo: constructParams(Chains.celo),
  blast: constructParams(Chains.blast),
  linea: constructParams(Chains.linea),
  op_bnb: constructParams(Chains.op_bnb),
  era: constructParams(Chains.era),
  polygon_zkevm: constructParams(Chains.polygon_zkevm),
  xlayer: constructParams(Chains.xlayer),
  bitrock: constructParams(Chains.bitrock),
  energi: constructParams(Chains.energi),
  odyssey: constructParams(Chains.odyssey),
  songbird: constructParams(Chains.songbird),

  // new non EVM chains
  bitcoin: constructParams(Chains.bitcoin),
  litecoin: constructParams(Chains.litecoin),
  doge: constructParams(Chains.doge),
  ripple: constructParams(Chains.ripple),
  cardano: constructParams(Chains.cardano),
  solana: constructParams(Chains.solana),
  // noble chain is temporarily not supported as it's marked as problematic
  // noble: constructParams(Chains.noble),
  
  // Enable tron chain support
  tron: constructParams(Chains.tron),
};

export default adapter;
