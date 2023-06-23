import postgres from "postgres";


const sql = postgres(
  `postgresql://${process.env.PSQL_USERNAME}:${process.env.PSQL_PW}@${process.env.PSQL_URL}:9004/cle37p03g00dhd6lff4ch90qw`,
  { idle_timeout: 20, max_lifetime: 60 * 3, max: 10 }
);

export { sql };
