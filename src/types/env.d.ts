declare namespace NodeJS {
  interface ProcessEnv {
    TOKEN: string;
    ADMIN_ID: string;
    PORT: string;
    DATABASE_URL: string;
    GOOGLE_AUTH_URL: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CALLBACK_URL: string;
    GOOGLE_CLIENT_SECRET: string;
    VERCEL_URL: string;
    GROUP: string;
    LOGS: string;
  }
}
