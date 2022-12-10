import { GraphQLClient, gql } from "graphql-request";
import { ZonesTableDocument } from "./ZonesTable.query.generated";
import { ethers } from "ethers";
import { EventData } from "../../utils/types";
import { getCurrentUnixTimestamp } from "../../utils/date";

const endpoint = "https://api2.mapofzones.com/v1/graphql";
const graphQLClient = new GraphQLClient(endpoint);

export const getLatestMapOfZonesTableData = async () => {
  const variables = {
    period: 24,
    isMainnet: true,
  };
  const data = await graphQLClient.request(ZonesTableDocument, variables);
  return data.zonesTable;
};

export const getIbcVolumeByZoneName = (chainName: string, zoneName: string) => {
  // @ts-ignore
  return async (fromBlock: number, toBlock: number) => {
    const timestamp = getCurrentUnixTimestamp();
    /*
     *
     * ***only allows adapters to run this function once per day***
     *
     */
    const currentHour = new Date(timestamp * 1000).getUTCHours();
    if (!(currentHour === 23)) {
      return [];
    }
    const tableData = await getLatestMapOfZonesTableData();
    const chainData = tableData.find((chain: any) => {
      return chain.zone === zoneName;
    });
    if (chainData) {
      const switchedStats = chainData.switchedStats[0];
      const { ibcVolumeOut, ibcVolumeIn } = switchedStats;
      const depositAmount = ethers.BigNumber.from(ibcVolumeOut);
      const depositTx = {
        blockNumber: timestamp,
        txHash: `flows-${chainName}-${timestamp}-deposit`,
        from: "null",
        to: "null",
        token: "null",
        amount: depositAmount,
        isDeposit: true,
        isUSDVolume: true,
      };
      const withdrawalAmount = ethers.BigNumber.from(ibcVolumeIn);
      const withdrawTx = {
        blockNumber: timestamp,
        txHash: `flows-${chainName}-${timestamp}-withdrawal`,
        from: "null",
        to: "null",
        token: "null",
        amount: withdrawalAmount,
        isDeposit: false,
        isUSDVolume: true,
      };
      return [depositTx, withdrawTx] as EventData[];
    } else return [];
  };
};
