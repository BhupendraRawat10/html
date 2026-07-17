import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import mysql from 'mysql2/promise';

async function migrate(): Promise<void> {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST ?? 'localhost',
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER ?? 'root',
    password: process.env.MYSQL_PASSWORD ?? '',
    database: process.env.MYSQL_DATABASE ?? 'chat_app',
    multipleStatements: true
  });

  try {
    console.log('Running migrations...');
    await connection.query(schemaSql);
    console.log('Migrations completed successfully.');
  } finally {
    await connection.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
