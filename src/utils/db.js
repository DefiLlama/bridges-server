import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const connectionString =
  process.env.DB_URL ??
  `postgresql://${process.env.PSQL_USERNAME}:${process.env.PSQL_PW}@${process.env.PSQL_URL}:5433/postgres`;

let sql = postgres(connectionString, {
  idle_timeout: 120,
  max_lifetime: 60 * 30,
  max: 10,
  connect_timeout: 30,
  keep_alive: true,
  onclose: async function (connId) {
    console.log(`[WARN] Connection ${connId} closed unexpectedly`);
  }
});

let querySql = postgres(connectionString, {
  idle_timeout: 120,
  max_lifetime: 60 * 30,
  max: 6,
  connect_timeout: 30,
  keep_alive: true,
  onclose: async function (connId) {
    console.log(`[WARN] Query connection ${connId} closed unexpectedly`);
  }
});

export { sql, querySql };
