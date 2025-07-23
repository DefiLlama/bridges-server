import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const connectionString =
  process.env.DB_URL ??
  `postgresql://${process.env.PSQL_USERNAME}:${process.env.PSQL_PW}@${process.env.PSQL_URL}:5433/postgres`;

const sql = postgres(connectionString, {
  idle_timeout: 20,
  max_lifetime: 60 * 30,
  max: 7,
});

const querySql = postgres(connectionString, {
  idle_timeout: 20,
  max_lifetime: 60 * 30,
  max: 4,
});

export { sql, querySql };
