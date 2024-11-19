const { startAlliumQuery, retrieveAlliumResults } = require("../helper/allium");
const { getCache, setCache } = require("../helper/cache");

type WormholeBridgeEvent = {
  blockTimestamp: string;
  txHash: string;
  from: string;
  to: string;
  token: string;
  token_usd_amount: string;
  token_amount: string;
};


const fetchWormholeEvents = async (fromTimestamp: string, toTimestamp: string): Promise<WormholeBridgeEvent[]> => {
  const queryId = await getCache("wormhole", "wormhole-token-transfers-query");
  const offset = 12;
  const newQuery = await startAlliumQuery(`
  select
    BLOCK_TIMSTAMP,
    TRANSACTION_HASH,
    TOKEN_TRANSFER_FROM_ADDRESS,
    TOKEN_TRANSFER_TO_ADDRESS,
    TOKEN_ADDRESS,
    TOKEN_USD_AMOUNT,
    TOKEN_AMOUNT,
  from org_db__defillama.default.wormhole_token_transfers
      where
        block_timestamp >= fromTimestamp
        and block_timestamp < toTimestamp;`)
    await setCache("wormhole", "wormhole-token-transfers-query", newQuery);
    const wormhole_token_transfers = await retrieveAlliumResults(queryId);
    return wormhole_token_transfers
};
