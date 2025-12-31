// import { Pool } from "pg";
// export const db = new Pool({ connectionString: process.env.DATABASE_URL });
import { Pool, QueryResultRow } from "pg";
import dotenv from "dotenv";
dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query<T extends QueryResultRow = any>(text: string, params?: any[]) {
  const res = await pool.query<T>(text, params);
  return res;
}
