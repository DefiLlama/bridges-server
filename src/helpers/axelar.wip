import { ethers } from "ethers";
import { llamaChainIds } from "../utils/constants";
const axios = require("axios");

// only returns maximum of 2000 transfers
export const getAxelarTransfersByChains = async (
  minTimestamp: number,
  maxTimestamp: number,
  sourceChain: string,
  destinationChain: string
) => {
  let transfers = [] as any;
  /*
  * NEED TO MAP CHAINS TO LLAMA CHAIN NAMES
  */
  for (let i = 0; i < 4; i++) {
    try {
      const options = {
        method: "POST",
        data: {
          sourceChain: sourceChain,
          destinationChain: destinationChain,
          fromTime: minTimestamp,
          toTime: maxTimestamp,
          size: 2000,
        },
      };
      const response = await axios.get(`https://api.axelarscan.io/cross-chain/transfers`, options);
      if (response?.status === 200) {
        transfers = response.data.data;
      } else {
        throw new Error(`Axelarscan returned response ${response?.status} with statusText ${response?.statusText}.`);
      }
      break;
    } catch (e) {
      if (i >= 3) {
        console.error(
          `Error getting Axelar transfers by chains, transfers in timestamp range ${minTimestamp} to ${maxTimestamp} skipped.`,
          e
        );
        return [];
      } else continue;
    }
  }

  const axelarAssets = await getAxelarAssets();
  if (Object.keys(axelarAssets).length === 0) {
    console.error(`Error getting Axelar assets, Axelar transactions SKIPPED.`);
    return [];
  }

  const transactions = transfers
    .map((transferData: any) => {
      const { source } = transferData;
      const { id, sender_address, recipient_address, amount, denom } = source;
      const assetContracts = axelarAssets[denom];
      const contractData = assetContracts?.[sourceChain];
      if (!contractData) {
        console.error(`Could not get asset info for tx with Axelar id ${id}, transaction SKIPPED.`);
        return null;
      } else {
        const { address, decimals } = contractData;
        const bnAmount = ethers.BigNumber.from(amount*(10 ** decimals));
        return {
          from: sender_address,
          to: recipient_address,
          token: address,
          amount: bnAmount,
          chainOverride: sourceChain, // don't know if this will work as-is or if utils/adapter requires changes for it
          isDeposit: true,
        };
      }
    })
    .filter((tx: any) => tx);

  return [
    ...transactions,
    ...transactions.map((tx: any) => {
      return { ...tx, chainOverride: destinationChain, isDeposit: false };
    }),
  ];
};

const getAxelarAssets = async () => {
  const response = await axios.get(`https://api.axelarscan.io/cross-chain/assets`);
  let assets = {} as any;
  let assetsResponse = [] as any;
  if (response?.status === 200) {
    assetsResponse = response.data;
    assetsResponse.map((assetData: any) => {
      const { id, contracts } = assetData;
      if (contracts?.length > 0) {
        contracts.map((contract: any) => {
          const { contract_address, chain_id, decimals } = contract;
          const chainName = llamaChainIds[chain_id];
          if (chainName) {
            assets[id] = assets[id] || {};
            assets[id][chainName] = { address: contract_address, decimals: decimals };
          }
        });
      }
    });
  } else {
    console.error(`Error getting Axelar assets, ${response?.status} ${response?.statusText}.`);
  }
  return assets as {
    [denom: string]: {
      [chain: string]: {
        address: string;
        decimals: number;
      };
    };
  };
};
