import pg from "pg";


export const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "testdb",
  password: "quake3q3dm6",
  port: 5432,
});


pool.on("connect", () => {
  console.log("DB connected");
});

