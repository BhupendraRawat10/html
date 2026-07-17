import mysql, { Pool } from 'mysql2/promise';
import { env } from './env';

export const pool: Pool = mysql.createPool({
  host: env.mysql.host,
  port: env.mysql.port,
  user: env.mysql.user,
  password: env.mysql.password,
  database: env.mysql.database,
  connectionLimit: env.mysql.connectionLimit,
  waitForConnections: true,
  dateStrings: false
});

export async function verifyMysqlConnection(): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    console.log('[mysql] connection verified');
  } finally {
    connection.release();
  }
}
