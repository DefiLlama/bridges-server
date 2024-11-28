import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const connectionString =
  process.env.DB_URL ??
  `postgresql://${process.env.PSQL_USERNAME}:${process.env.PSQL_PW}@${process.env.PSQL_URL}:9004/cle37p03g00dhd6lff4ch90qw`;

const sql = postgres(connectionString, { idle_timeout: 200, max_lifetime: 60 * 5, max: 10 });

export { sql };
