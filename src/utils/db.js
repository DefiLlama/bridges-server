import postgres from "postgres";

const sql = postgres(
  {
    host: process.env.PSQL_URL,
    database: "bridges",
    username: process.env.PSQL_USERNAME,
    password: process.env.PSQL_PW,
    port: 9004,
    idle_timeout: 20,
    max_lifetime: 60 * 3,
    max: 10,
  }
);

export { sql };
