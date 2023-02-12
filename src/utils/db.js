import postgres from "postgres";

const sql = postgres(
  {
    host: 'bridges.cz3l9ki794cf.eu-central-1.rds.amazonaws.com',
    database: "bridges",
    username: 'postgresmaster',
    password: process.env.PSQL_PW,
    idle_timeout: 20,
    max_lifetime: 60 * 3,
    max: 10,
  }
);

export { sql };
