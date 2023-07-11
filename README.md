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
