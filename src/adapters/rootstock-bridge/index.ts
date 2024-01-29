import {
    BridgeAdapter,
    ContractEventParams,
  } from "../../helpers/bridgeAdapter.type";
  import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
  
  const bridge = "0x0000000000000000000000000000000001000006"
  
  const peginEventParams: ContractEventParams = {
    target: bridge,
    topic: "pegin_btc(address,bytes32,int256,int256)",
    abi: [
      "event pegin_btc(address indexed receiver, bytes32 indexed btcTxHash, int256 amount, int256 protocolVersion)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    fixedEventData: {
      from: bridge,
      token: "RBTC",
    },
    argKeys: {      
      to: "receiver",
      amount: "amount"
    },
    isDeposit: true,
  };
  
  
  const pegOutEventParams: ContractEventParams = {
    target: bridge,
    topic: "release_request_received(address,string,uint256)",
    abi: [
      "event release_request_received(address indexed sender, string btcDestinationAddress, uint256 amount)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    fixedEventData: {
      to: bridge,
      token: "RBTC",      
    },
    argKeys: {      
      amount: "amount",
      from: "sender"
    },
    isDeposit: false,
  };
  
  const constructParams = () => {
    const eventParams = [
        peginEventParams,
        pegOutEventParams
    ];
    return async (fromBlock: number, toBlock: number) =>
      getTxDataFromEVMEventLogs("rootstock-bridge", "rsk", fromBlock, toBlock, eventParams);
  };
  
  const adapter: BridgeAdapter = {
    rsk: constructParams(),
  };
  
  export default adapter;
  