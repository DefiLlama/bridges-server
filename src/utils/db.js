import postgres from "postgres";

const sql = postgres(
  {
    host: process.env.PSQL_URL,
    database: "cle37p03g00dhd6lff4ch90qw",
    username: process.env.PSQL_USERNAME,
    password: process.env.PSQL_PW,
    port: 9004,
    idle_timeout: 20,
    max_lifetime: 60 * 3,
    max: 10,
  }
);

export { sql };
