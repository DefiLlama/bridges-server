import postgres from "postgres";

const sql = postgres(
  {
    host: 'bridges.cz3l9ki794cf.eu-central-1.rds.amazonaws.com',
    database: "bridges",
    username: 'postgresmaster',
    password: '2zbDKWZt5X6iJaGD7Oew',
    idle_timeout: 20,
    max_lifetime: 60 * 30,
  }
);

export { sql };
