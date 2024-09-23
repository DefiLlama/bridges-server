# Bridges adapters

## Installation 

   `npm i`


## Adding new adapter
### Adapter output
Array of
```ts 
txHash:  string,
blockNumber:  number,
from:  string,
to:  string,
token:  string,
isDeposit:  boolean 
amount: BigNumber 
```
If your bridge is on 2 chains you can create adapter for 1 chain and track both deposits and withdrawals
```ts
const  adapter: BridgeAdapter = {
ethereum:  constructParams("ethereum"),
polygon:  constructParams("polygon"),
fantom:  constructParams("fantom"),
avalanche:  constructParams("avax"),
bsc:  constructParams("bsc"),
klaytn:  constructParams("klaytn"),
}; 
```

### Log event parameters
```ts
type  ContractEventParams = {
target: string | null;
topic: string;
abi: string[];
logKeys?: EventKeyMapping; // retrieve data from event log
argKeys?: EventKeyMapping; // retrieve data from parsed event log
argGetters?: Partial<Record<keyof  EventKeyMapping, (log: any) =>  any>>;
txKeys?: EventKeyMapping; // retrieve data from transaction referenced in event log
topics?: (string | null)[];
isDeposit: boolean;
chain?: Chain; // override chain given as parameter in getTxDataFromEVMEventLogs
isTransfer?: boolean;
fixedEventData?: EventKeyMapping; // hard-code any final values
inputDataExtraction?: InputDataExtraction; // retrieve data from event log's input data field
selectIndexesFromArrays?: EventKeyMapping; // extract data returned as an array by specifying the index of element
functionSignatureFilter?: FunctionSignatureFilter;
filter?: EventLogFilter;
mapTokens?: { [token: string]: string }; // can expand to map other keys if needed
getTokenFromReceipt?: {
token: boolean;
amount?: boolean;
native?: string; // if provided native token address, will return amount of native token transferred if there are no ercs transferred
};
```

### Example 
```ts
const  ethWithdrawalParams: PartialContractEventParams = {
target: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1",
topic: "ETHWithdrawalFinalized(address,address,uint256,bytes)",
abi: ["event ETHWithdrawalFinalized(address indexed _from, address indexed _to, uint256 _amount, bytes _data)"],
isDeposit: false, // event type 
logKeys: {
  blockNumber:  "blockNumber", 
  txHash:  "transactionHash",// if event log data key != adapter ouptup key
},
argKeys: {
  to: "_to", 
  amount: "_amount", // if event data key !== output key
},
fixedEventData: {
  from: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1", // static keys
  token: WETH,
},
}; 
```
### Bridge Data
Create new object for your bridge in ` ./src/data/bridgeNetworkData.ts`
```ts
id:  1, // new id 
displayName:  "Polygon PoS Bridge", // name
bridgeDbName:  "polygon", // name in db
iconLink:  "chain:polygon", // icon name in https://icons.llamao.fi/icons/
largeTxThreshold:  10000,
url:  "",
chains: ["Ethereum", "Polygon"], // Bridge chains. If your bridge is on 2 chains you can create adapter for 1 chain and track both deposits and withdrawals
destinationChain:  "Polygon", // When bridge connects 2 chains, for example Ethereum<->Optimism and there is only one adapter on one chain which tracks deposits and withdrawals for both chains
```


### Docker 

1) Build image 

`docker build -f ./docker/Dockerfile -t postgres-bridges . `

2) Run container
  
`docker run --name postgres-bridges -d -p 5433:5432 postgres-bridges`


3) Run testing scripts in this order 

syntax: `npm run {script-name} {startTimestamp} {endTimestamp} {bridgeName}`

1) backfill transactions `npm run adapter`
2) aggregate volume `npm run aggregate`
3) calculate daily volume  `npm run daily-volume`

Example: 
```
npm run adapter arbitrum 1704690402 1704949602
npm run aggregate arbitrum 1704690402 1704949602
npm run daily-volume arbitrum 1704690402 1704949602 
```
Returns: 
```
[
  {
    date: '1704672000',
    depositUSD: 20158446,
    withdrawUSD: 4130695,
    depositTxs: 888,
    withdrawTxs: 71
  },
  {
    date: '1704758400',
    depositUSD: 14309807,
    withdrawUSD: 2193118,
    depositTxs: 237,
    withdrawTxs: 43
  }
]
```

For better speed you can add custom rpc to `.env.test`

Example: 
```
{CHAIN}_RPC=url1,url2...
ETHEREUM_RPC=https://eth.llamarpc.com
```


### Testing 

#### Adapter Testing:
```bash
npm run test [adapter name] [number of blocks to test on]
Example: 
npm run test across 1000
```

#### Backfill testing:
```bash
npm run test-txs [start ts] [end ts] [adapter name]
Example: 
npm run test-txs 1688476361 1688919317 synapse
```
 

