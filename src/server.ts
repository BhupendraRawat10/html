import { createApp } from './app';
import { env } from './config/env';
import { verifyMysqlConnection } from './config/mysql';
import './config/firebase'; // ensures Firebase Admin is initialized

async function main(): Promise<void> {
  await verifyMysqlConnection();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`[server] listening on port ${env.port} (${env.nodeEnv})`);
  });
}

main().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});
