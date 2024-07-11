import { getProvider } from "@defillama/sdk/build/general";
import { BigNumber, ethers } from "ethers"
import padAbi from './abi.json' assert { type: 'json' };

export async function getPadContractTxValue(chain: string, txHash: string, ): Promise<BigNumber> {
  console.log(`start getPadContractTxValue, ${txHash}`);
  const provider = getProvider(chain);
  const txReceipt = await provider.getTransactionReceipt(txHash);
  if(!txReceipt){
    return BigNumber.from(0);
  }

  const contractInterface = new ethers.utils.Interface(padAbi);
  const parsedLogs = txReceipt.logs.map(log => {
    try {
      const parsedLog = contractInterface.parseLog({topics: log.topics as string[], data: log.data});
      return parsedLog;
    }
    catch(error) {
      const e = error as Error;
      console.error(e.message);
      return null
    }
  }).filter(log => log != null) as ethers.utils.LogDescription[];

  let totalValue = BigNumber.from(0)
  for(const parsedLog of parsedLogs) {
    let value = BigNumber.from(0);
    if(parsedLog.name == 'SuccessfulLaunchMessage') {
      //TODO: add contract process
      value = parsedLog.args[6]
    } else if (parsedLog.name == 'SuccessfulLanding') {
      value = BigNumber.from(parsedLog.args[1][8]).mul(-1)
    } else if (parsedLog.name == 'SuccessfulLaunchMultiMessages') {
      value = parsedLog.args[6]
    }
    totalValue = totalValue.add(value);
  }
  return totalValue;
}