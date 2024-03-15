import BigNumber from "bignumber.js";
import { BridgeAdapter, ContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { supportedTokens} from "./constant";
import { ethers } from "ethers";

const bridge = "0x9d11937e2179dc5270aa86a3f8143232d6da0e69";

const getSupportedToken = (token: string) => {
    if (token) {
      return Object.values(supportedTokens).find( st => st.address.ethereum == token || st.address.rootstock == token) 
    }
}

const crossEventParams: ContractEventParams = {
  target: bridge,
  topic: "Cross(address,address,address,uint256,bytes)",
  abi: ["event Cross(address indexed _tokenAddress, address indexed _from, address indexed _to, uint256 _amount, bytes _userData)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  fixedEventData: {    
    to: bridge
  },
  argKeys: {
    from: "_from",
    amount: "_amount",    
  },
  inputDataExtraction: {
    inputDataABI: [
      "function receiveTokensTo(address tokenToUse, address to, uint256 amount)",
    ],
    inputDataFnName: "receiveTokensTo",
    inputDataKeys: {
      token: "tokenToUse",
    },
  },
  isDeposit: false,
};


const claimedEventParams: ContractEventParams = {
  target: bridge,
  topic: "Claimed(bytes32,address,address,address,uint256,bytes32,uint256,address,address,uint256)",
  abi: ["event Claimed(bytes32 indexed _transactionHash, address indexed _originalTokenAddress, address indexed _to, address _sender, uint256 _amount, bytes32 _blockHash, uint256 _logIndex, address _reciever, address _relayer, uint256 _fee)"],  
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  fixedEventData: {
    from: bridge,    
  },
  argKeys: {
    amount: "_amount",
    to: "_to",
    token: "_originalTokenAddress"
  },
  isDeposit: true,
};

const constructParams = () => {
  const eventParams = [crossEventParams, claimedEventParams];
  return async (fromBlock: number, toBlock: number) => {
    const logs = await getTxDataFromEVMEventLogs("tokenbridge", "rsk", fromBlock, toBlock, eventParams);    

    logs.forEach((log) => {
      const supportedToken = getSupportedToken(log.token)
      if (log.isDeposit && supportedToken) {      
        log.token = supportedToken.address.rootstock;
        const decimals = supportedToken.decimal.rootstock - supportedToken.decimal.ethereum;
        log.amount = log.amount?.mul(ethers.BigNumber.from(10).pow(decimals));
      }      
      log.token = logs[0]?.token.toLowerCase();
    });

    return logs;
  };
};

const adapter: BridgeAdapter = {
  rootstock: constructParams(),
};

export default adapter;