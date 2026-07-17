import 'dotenv/config';


function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {

    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}


export const env = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',


  mysql: {
    host: process.env.MYSQL_HOST ?? 'localhost',

    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: required('MYSQL_USER', 'root'),
    password: process.env.MYSQL_PASSWORD ?? '',
    database: required('MYSQL_DATABASE', 'chat_app'),
    connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT ?? 10)
  },

  firebase: {
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }
};
