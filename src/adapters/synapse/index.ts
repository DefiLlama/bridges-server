import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, ContractEventParams, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { constructTransferParams } from "../../helpers/eventParams";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const nullAddress = "0x0000000000000000000000000000000000000000";

//TODO fill in the rest of the synapse bridge contracts
//Synapse Bridge Contracts on all supported chains
const contractAddresses = {
    polygon: {
        synapseBridge: "0x8F5BBB2BB8c2Ee94639E55d5F41de9b4839C1280",
    },
    arbitrum: {
        synapseBridge: "0x6F4e8eBa4D337f874Ab57478AcC2Cb5BACdc19c9",
    },

} as {
    [chain: string]: {
        synapseBridge: string;

    };
  };


//Partial Contract Event parameters for each relevant event on the Synapse Bridge Contracts
  

  const TokenDepositDepositParams: PartialContractEventParams = {
    target: "",
    //Using "address" instead of "contract" in topic and abi because code fails without this
    topic:"TokenDeposit(address,uint256,address,uint256)",
    abi: [
      "event TokenDeposit(address indexed to, uint256 chainId, address, uint256 amount)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "token",
      amount: "amount",
      to: "to"
    },
    fixedEventData: {

    },
    isDeposit: true,
  };

  const TokenDepositAndSwapDepositParams: PartialContractEventParams = {
    target: "",
    //Not sure if "contract IERC20" is the right thing here?? Need to double check
    topic:"TokenDepositAndSwap(address,uint256,contract,uint256,uint8,uint8,uint256,uint256)",
    abi: [
      "event TokenDepositAndSwap(address indexed to, uint256 chainId, address, uint256 amount, uint8 tokenIndexFrom, uint8 tokenIndexTo, uint256 minDy, uint256 deadline)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "token",
      amount: "amount",
      to: "to"
    },
    fixedEventData: {

    },
    isDeposit: true,
  };

  const TokenRedeemDepositParams: PartialContractEventParams = {
    target: "",
    //Not sure if contract is the right thing here?? Need to double check
    topic:"TokenRedeem(address,uint256,address,uint256)",
    abi: [
      "event TokenRedeem(address indexed to, uint256 chainId, address, uint256 amount)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "token",
      amount: "amount",
      to: "to"
    },
    fixedEventData: {

    },
    isDeposit: true,
  };

  const TokenRedeemAndRemoveDepositParams: PartialContractEventParams = {
    target: "",
    //Not sure if contract is the right thing here?? Need to double check
    topic:"TokenRedeemAndRemove(address,uint256,address,uint256,uint8,uint256,uint256)",
    abi: [
      "event TokenRedeemAndRemove(address indexed to, uint256 chainId, address, uint256 amount, uint8 swapTokenIndex, uint256 swapMinAmount, uint256 swapDeadline)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "token",
      amount: "amount",
      to: "to"
    },
    fixedEventData: {

    },
    isDeposit: true,
  };

  const TokenRedeemAndSwapDepositParams: PartialContractEventParams = {
    target: "",
    //Not sure if contract is the right thing here?? Need to double check
    topic:"TokenRedeemAndSwap(address,uint256,address,uint256,uint8,uint8,uint256,uint256)",
    abi: [
      "event TokenRedeemAndSwap(address indexed to, uint256 chainId, address, uint256 amount, uint8 tokenIndexFrom, uint8 tokenIndexTo, uint256 minDy, uint256 deadline)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "token",
      amount: "amount",
      to: "to"
    },
    fixedEventData: {

    },
    isDeposit: true,
  };

  const TokenRedeemV2DepositParams: PartialContractEventParams = {
    target: "",
    //Not sure if contract is the right thing here?? Need to double check
    topic:"TokenRedeemV2(bytes32,uint256,address,uint256)",
    abi: [
      "event TokenRedeemV2(bytes32 indexed to, uint256 chainId, address, uint256 amount)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "token",
      amount: "amount",
      to: "to"
    },
    fixedEventData: {

    },
    isDeposit: true,
  };

//Begin outlining the withdraws
const TokenWithdrawWithdrawParams: PartialContractEventParams = {
    target: "",
    //Not sure if contract is the right thing here?? Need to double check
    topic:"TokenWithdraw(address,address,uint256,uint256,bytes32)",
    abi: [
      "event TokenWithdraw(address indexed to, address, uint256 amount, uint256 fee, bytes32 indexed kappa)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "token",
      amount: "amount",
      to: "to"
    },
    fixedEventData: {

    },
    isDeposit: false,
  };

  const TokenWithdrawAndRemoveWithdrawParams: PartialContractEventParams = {
    target: "",
    //Not sure if contract is the right thing here?? Need to double check
    topic:"TokenWithdrawAndRemove(address,address,uint256,uint256,uint8,uint256,uint256,bool,bytes32)",
    abi: [
      "event TokenWithdrawAndRemove(address indexed to, address, uint256 amount, uint256 fee, uint8 swapTokenIndex, uint256 swapMinAmount, uint256 swapDeadline, bool swapSuccess, bytes32 indexed kappa)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "token",
      amount: "amount",
      to: "to"
    },
    fixedEventData: {

    },
    isDeposit: false,
  };

  const TokenMintWithdrawParams: PartialContractEventParams = {
    target: "",
    //Not sure if contract is the right thing here?? Need to double check
    topic:"TokenMint(address,address,uint256,uint256,bytes32)",
    abi: [
      "event TokenMint(address indexed to, address, uint256 amount, uint256 fee, bytes32 indexed kappa)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "token",
      amount: "amount",
      to: "to"
    },
    fixedEventData: {

    },
    isDeposit: false,
  };

  const TokenMintAndSwapWithdrawParams: PartialContractEventParams = {
    target: "",
    //Not sure if contract is the right thing here?? Need to double check
    topic:"TokenMintAndSwap(address,address,uint256,uint256,uint8,uint8,uint256,uint256,bool,bytes32)",
    abi: [
      "event TokenMintAndSwap(address indexed to, address, uint256 amount, uint256 fee, uint8 tokenIndexFrom, uint8 tokenIndexTo, uint256 minDy, uint256 deadline, bool swapSuccess, bytes32 indexed kappa)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "token",
      amount: "amount",
      to: "to"
    },
    fixedEventData: {

    },
    isDeposit: false,
  };


//Add all partial events to eventParams

const constructParams = (chain:string) => {
    //Deposits:
    const finalTokenDepositDepositParams = {
        ...TokenDepositDepositParams,
        target:contractAddresses[chain].synapseBridge
    }
    const finalTokenDepositAndSwapDepositParams = {
        ...TokenDepositAndSwapDepositParams,
        target:contractAddresses[chain].synapseBridge
    }
    const finalTokenRedeemDepositParams = {
        ...TokenRedeemDepositParams,
        target:contractAddresses[chain].synapseBridge
    }
    const finalTokenRedeemAndSwapDepositParams = {
        ...TokenRedeemAndSwapDepositParams,
        target:contractAddresses[chain].synapseBridge
    }
    const finalTokenRedeemAndRemoveDepositParams = {
        ...TokenRedeemAndRemoveDepositParams,
        target:contractAddresses[chain].synapseBridge
    }
    const finalTokenRedeemV2DepositParams = {
        ...TokenRedeemV2DepositParams,
        target:contractAddresses[chain].synapseBridge
    }
    
    // Withdraws
    const finalTokenWithdrawWithdrawParams = {
        ...TokenWithdrawWithdrawParams,
        target:contractAddresses[chain].synapseBridge
    }
    const finalTokenWithdrawAndRemoveWithdrawParams = {
        ...TokenWithdrawAndRemoveWithdrawParams,
        target:contractAddresses[chain].synapseBridge
    }
    const finalTokenMintWithdrawParams = {
        ...TokenMintWithdrawParams,
        target:contractAddresses[chain].synapseBridge
    }
    const finalTokenMintAndSwapWithdrawParams = {
        ...TokenMintAndSwapWithdrawParams,
        target:contractAddresses[chain].synapseBridge
    }



    const eventParams = [
        finalTokenDepositDepositParams,
        finalTokenDepositAndSwapDepositParams,
        finalTokenRedeemDepositParams,
        finalTokenRedeemAndSwapDepositParams,
        finalTokenRedeemAndRemoveDepositParams,
        finalTokenRedeemV2DepositParams,
        finalTokenWithdrawWithdrawParams,
        finalTokenWithdrawAndRemoveWithdrawParams,
        finalTokenMintWithdrawParams,
        finalTokenMintAndSwapWithdrawParams
    ]

    return async (fromBlock: number, toBlock: number) =>
        getTxDataFromEVMEventLogs("synapse_test", chain, fromBlock, toBlock, eventParams);

}



const adapter: BridgeAdapter = {
    //TODO add more chains
    polygon: constructParams("polygon"),
    arbitrum: constructParams("arbitrum"),
  };

  export default adapter;





  
  // Example contracts: 
//  Using bridge Zap contract : https://polygonscan.com/tx/0x2cec1d015aef431b5363e7e68afc3c7bd9eecb17a7ea997dc7b5067ecb2167dc
// Using Router Contract: https://polygonscan.com/tx/0xf94193d101fdc9240aafd6069b3e02397a8bc5aff3c2e2f08b969689c7d9f290
// Using regular Bridge Contract: https://polygonscan.com/tx/0x3ffe45b68bb42661b0081b76fc04699ca76944e3113f1c10a397ec0fc5e16f2b


