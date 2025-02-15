import axios from "axios";

const token = {} as Record<string, string>;

const HEADERS = {
  "Content-Type": "application/json",
  "X-API-KEY": process.env.ALLIUM_API_KEY,
} as Record<string, string>;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function startAlliumQuery(sqlQuery: string) {
  const query = await axios.post(
    `https://api.allium.so/api/v1/explorer/queries/phBjLzIZ8uUIDlp0dD3N/run-async`,
    {
      parameters: {
        fullQuery: sqlQuery,
      },
    },
    {
      headers: HEADERS,
    }
  );

  return query.data["run_id"];
}

async function retrieveAlliumResults(queryId: string) {
  const results = await axios.get(`https://api.allium.so/api/v1/explorer/query-runs/${queryId}/results?f=json`, {
    headers: HEADERS,
  });
  return results.data.data;
}

async function cancelAlliumQuery(queryId: string) {
  const response = await axios.post(`https://api.allium.so/api/v1/explorer/query-runs/${queryId}/cancel`, {
    headers: HEADERS,
  });
  return response.data;
}

async function queryAllium(sqlQuery: string) {
  const startTime = Date.now();
  for (let i = 0; i < 10; i++) {
    console.log(`Querying Allium. Attempt ${i}`);
    if (!token[sqlQuery]) {
      token[sqlQuery] = await startAlliumQuery(sqlQuery);
    }

    if (!token[sqlQuery]) {
      throw new Error("Couldn't get a token from allium");
    }

    const statusReq = await axios.get(`https://api.allium.so/api/v1/explorer/query-runs/${token[sqlQuery]}/status`, {
      headers: HEADERS,
    });
    const status = statusReq.data;
    if (status === "success") {
      try {
        const results = await retrieveAlliumResults(token[sqlQuery]);
        delete token[sqlQuery];
        return results;
      } catch (e) {
        console.log("query result", e);
        throw e;
      }
    } else if (status === "failed") {
      delete token[sqlQuery];
      continue;
    }
    await sleep(20e3);
  }
  await cancelAlliumQuery(token[sqlQuery]);
  console.log(`Query ${sqlQuery} took ${(Date.now() - startTime) / 1000}s`);
  throw new Error("Not processed in time");
}

export { queryAllium, startAlliumQuery, retrieveAlliumResults };
