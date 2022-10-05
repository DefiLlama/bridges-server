import postgres from "postgres";

const sql = postgres(
  {
    host: process.env.PSQL_URL,
    database: "bridges",
    username: process.env.PSQL_USERNAME,
    password: process.env.PSQL_PW,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
  }
);

export { sql };
