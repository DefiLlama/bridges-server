import { IResponse, successResponse, errorResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { getTimestampAtStartOfDay } from "../utils/date";
import { queryAggregatedDailyDataAtTimestamp, queryConfig } from "../utils/wrappa/postgres/query";
import { getLlamaPrices } from "../utils/prices";
import { importBridgeNetwork } from "../data/importBridgeNetwork";
import BigNumber from "bignumber.js";
import { normalizeChain } from "../utils/normalizeChain";

const numberOfTokensToReturn = 30 // also determines # of addresses returned

// the following 2 types should probably be combined
type TokenRecord = {
  [token: string]: {
    amount: string;
    usdValue: number;
    symbol?: string;
    decimals?: number;
  };
};

type TokenRecordBn = {
  [token: string]: {
    amountBn: BigNumber;
  };
};

type AddressRecord = {
  [address: string]: {
    usdValue: number;
    txs: number;
  };
};

interface IAggregatedData {
  bridge_id: string;
  ts: Date;
  total_tokens_deposited: string[];
  total_tokens_withdrawn: string[];
  total_deposited_usd: string;
  total_withdrawn_usd: string;
  total_deposit_txs: number;
  total_withdrawal_txs: number;
  total_address_deposited: string[];
  total_address_withdrawn: string[];
}

const sumTokenTxs = async (
  tokenTotals: string[],
  dailyTokensRecord: TokenRecord,
) => {
  if (!tokenTotals) return
  let dailyTokensRecordBn = {} as TokenRecordBn;
  const tokenSet = new Set<string>();
  tokenTotals.map((tokenString) => {
    const tokenData = tokenString.replace(/[('") ]/g, "").split(",");
    const token = tokenData[0];
    tokenSet.add(token);
    const amountBn = BigNumber(tokenData[1]);
    const usdValue = parseFloat(tokenData[2]);
    dailyTokensRecordBn[token] = dailyTokensRecordBn[token] || {};
    dailyTokensRecordBn[token].amountBn = dailyTokensRecordBn[token].amountBn
      ? dailyTokensRecordBn[token].amountBn.plus(amountBn)
      : BigNumber(amountBn);
    dailyTokensRecord[token] = dailyTokensRecord[token] || {};
    dailyTokensRecord[token].usdValue = (dailyTokensRecord[token].usdValue ?? 0) + usdValue;
  });

  const prices = await getLlamaPrices(Array.from(tokenSet));

  Object.entries(dailyTokensRecordBn).map(([token, tokenData]) => {
    dailyTokensRecord[token].amount = tokenData.amountBn?.toFixed() ?? "0";
    dailyTokensRecord[token].symbol = prices?.[token]?.symbol ?? "";
    dailyTokensRecord[token].decimals = prices?.[token]?.decimals ?? 0;
  });
};

const sumAddressTxs = (addressTotals: string[], dailyAddresssRecord: AddressRecord) => {
  if (!addressTotals) return
  addressTotals.map((addressString) => {
    const addressData = addressString.replace(/[('") ]/g, "").split(",");
    const address = addressData[0];
    const usdValue = parseFloat(addressData[1]);
    const txs = parseInt(addressData[2]);
    dailyAddresssRecord[address] = dailyAddresssRecord[address] || {};
    dailyAddresssRecord[address].usdValue = (dailyAddresssRecord[address].usdValue ?? 0) + usdValue;
    dailyAddresssRecord[address].txs = (dailyAddresssRecord[address].txs ?? 0) + txs;
  });
};

// can also return total deposit/withdraw USD, deposit/withdraw #txs here if needed
// don't let chain be 'all'
const getBridgeStatsOnDay = async (timestamp: string = "0", chain: string, bridgeId?: string) => {
  let bridgeDbName = undefined as any;
  const queryChain = chain === "" ? "" : normalizeChain(chain)
  if (!bridgeId) {
    bridgeDbName = undefined;
  } else {
    try {
      const bridgeNetwork = importBridgeNetwork(undefined, parseInt(bridgeId))
      if (!bridgeNetwork) {
        throw new Error("No bridge network found.");
      }
      ({ bridgeDbName } = bridgeNetwork);
    } catch (e) {
      return errorResponse({
        message: "Invalid bridgeId entered.",
      });
    }
  }

  const sourceChainConfigs = (await queryConfig(undefined, undefined, queryChain)).filter((config) => {
    if (bridgeId) {
      return config.bridge_name === bridgeDbName;
    }
    return true;
  });

  const queryTimestamp = getTimestampAtStartOfDay(parseInt(timestamp));

  let sourceChainsDailyData = [] as IAggregatedData[];
  await Promise.all(
    sourceChainConfigs.map(async (config) => {
      const sourceChainData = await queryAggregatedDailyDataAtTimestamp(
        queryTimestamp,
        config.chain,
        config.bridge_name
      );
      sourceChainsDailyData = [...sourceChainData, ...sourceChainsDailyData];
    })
  );
  const dailyData = await queryAggregatedDailyDataAtTimestamp(queryTimestamp, queryChain, bridgeDbName);
  let dailyTokensDeposited = {} as TokenRecord;
  let dailyTokensWithdrawn = {} as TokenRecord;
  let dailyAddressesDeposited = {} as AddressRecord;
  let dailyAddressesWithdrawn = {} as AddressRecord;
  const dailyDataPromises = Promise.all(
    dailyData.map(async (dayData) => {
      const { total_tokens_deposited, total_tokens_withdrawn, total_address_deposited, total_address_withdrawn } =
        dayData;
      await sumTokenTxs(total_tokens_deposited, dailyTokensDeposited);
      await sumTokenTxs(total_tokens_withdrawn, dailyTokensWithdrawn);
      await sumAddressTxs(total_address_deposited, dailyAddressesDeposited);
      await sumAddressTxs(total_address_withdrawn, dailyAddressesWithdrawn);
    })
  );
  await dailyDataPromises;

  // deposits and withdrawals are swapped here
  const sourceChainsPromises = Promise.all(
    sourceChainsDailyData.map(async (dayData) => {
      const { total_tokens_deposited, total_tokens_withdrawn, total_address_deposited, total_address_withdrawn } =
        dayData;
      await sumTokenTxs(total_tokens_deposited, dailyTokensWithdrawn);
      await sumTokenTxs(total_tokens_withdrawn, dailyTokensDeposited);
      await sumAddressTxs(total_address_deposited, dailyAddressesWithdrawn);
      await sumAddressTxs(total_address_withdrawn, dailyAddressesDeposited);
    })
  );
  await sourceChainsPromises;

  const sortedDailyTokensDeposited = Object.fromEntries(Object.entries(dailyTokensDeposited).sort((a, b) => {
    return (b[1].usdValue - a[1].usdValue)
  }).slice(0, numberOfTokensToReturn))
  const sortedDailyTokensWithdrawn = Object.fromEntries(Object.entries(dailyTokensWithdrawn).sort((a, b) => {
    return (b[1].usdValue - a[1].usdValue)
  }).slice(0, numberOfTokensToReturn))
  const sortedDailyAddressesDeposited = Object.fromEntries(Object.entries(dailyAddressesDeposited).sort((a, b) => {
    return (b[1].usdValue - a[1].usdValue)
  }).slice(0, numberOfTokensToReturn))
  const sortedDailyAddressesWithdrawn = Object.fromEntries(Object.entries(dailyAddressesWithdrawn).sort((a, b) => {
    return (b[1].usdValue - a[1].usdValue)
  }).slice(0, numberOfTokensToReturn))

  const response = {
    date: queryTimestamp,
    totalTokensDeposited: sortedDailyTokensDeposited,
    totalTokensWithdrawn: sortedDailyTokensWithdrawn,
    totalAddressDeposited: sortedDailyAddressesDeposited,
    totalAddressWithdrawn: sortedDailyAddressesWithdrawn,
  };

  return response;
};

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<IResponse> => {
  const timestamp = event.pathParameters?.timestamp;
  if(Number(timestamp) % 3600 !== 0){
    return errorResponse({
      message: "timestamp must be divible by 3600"
    })
  }
  const chain = event.pathParameters?.chain?.toLowerCase() ?? "";
  const bridgeNetworkId = event.queryStringParameters?.id;
  const response = await getBridgeStatsOnDay(timestamp, chain, bridgeNetworkId);
  return successResponse(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);
