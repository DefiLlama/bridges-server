import { IResponse, successResponse, errorResponse } from "../utils/lambda-response";
import wrap from "../utils/wrap";
import { getTimestampAtStartOfDay } from "../utils/date";
import { queryAggregatedDailyDataAtTimestamp } from "../utils/wrappa/postgres/query";
import { getLlamaPrices } from "../utils/prices";
import bridgeNetworks from "../data/bridgeNetworkData";
import BigNumber from "bignumber.js";

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

const sumTokenTxs = async (
  tokenTotals: string[],
  dailyTokensRecord: TokenRecord,
  dailyTokensRecordBn: TokenRecordBn
) => {
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

// for bridges with dest. chain, always call 'all' from frontend and invert the flows;
// for other bridges, have to select chain and call with a selected chain
// can also return total deposit/withdraw USD, deposit/withdraw #txs here if needed
const getBridgeStatsOnDay = async (timestamp: string = "0", chain: string = "all", bridgeId?: string) => {
  let bridgeDbName;
  if (!bridgeId) {
    return errorResponse({
      message: "Must include bridge id in query string.",
    });
  }
  try {
    const bridgeNetwork = bridgeNetworks.filter((bridgeNetwork) => bridgeNetwork.id === parseInt(bridgeId))[0];
    if (!bridgeNetwork) {
      throw new Error("No bridge network found.");
    }
    ({ bridgeDbName } = bridgeNetwork);
  } catch (e) {
    return errorResponse({
      message: "Invalid bridgeId entered.",
    });
  }

  const queryTimestamp = getTimestampAtStartOfDay(parseInt(timestamp));
  const queryChain = chain === "all" ? undefined : chain;

  const dailyData = await queryAggregatedDailyDataAtTimestamp(queryTimestamp, queryChain, bridgeDbName);

  let dailyTokensDeposited = {} as TokenRecord;
  let dailyTokensWithdrawn = {} as TokenRecord;
  let dailyTokensDepositedBn = {} as TokenRecordBn;
  let dailyTokensWithdrawnBn = {} as TokenRecordBn;
  let dailyAddressesDeposited = {} as AddressRecord;
  let dailyAddressesWithdrawn = {} as AddressRecord;

  const dailyDataPromises = Promise.all(
    dailyData.map(async (dayData) => {
      const { total_tokens_deposited, total_tokens_withdrawn, total_address_deposited, total_address_withdrawn } =
        dayData;
      await sumTokenTxs(total_tokens_deposited, dailyTokensDeposited, dailyTokensDepositedBn);
      await sumTokenTxs(total_tokens_withdrawn, dailyTokensWithdrawn, dailyTokensWithdrawnBn);
      await sumAddressTxs(total_address_deposited, dailyAddressesDeposited);
      await sumAddressTxs(total_address_withdrawn, dailyAddressesWithdrawn);
    })
  );

  await dailyDataPromises;

  const response = {
    date: queryTimestamp,
    totalTokensDeposited: dailyTokensDeposited,
    totalTokensWithdrawn: dailyTokensWithdrawn,
    totalAddressDeposited: dailyAddressesDeposited,
    totalAddressWithdrawn: dailyAddressesWithdrawn,
  };

  return response;
};

const handler = async (
  event: AWSLambda.APIGatewayEvent
): Promise<IResponse> => {
  const timestamp = event.pathParameters?.timestamp;
  const chain = event.pathParameters?.chain?.toLowerCase();
  const bridgeNetworkId = event.queryStringParameters?.id;
  const response = await getBridgeStatsOnDay(timestamp, chain, bridgeNetworkId);
  return successResponse(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);
