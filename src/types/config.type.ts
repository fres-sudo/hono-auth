export const config: Config = {
  isProduction: process.env.NODE_ENV === "production",
  api: {
    origin: process.env.ORIGIN ?? "",
  },
  postgres: {
    url: process.env.DATABASE_URL ?? "",
  },
};

interface Config {
  isProduction: boolean;
  api: ApiConfig;
  postgres: PostgresConfig;
}

interface ApiConfig {
  origin: string;
}

interface PostgresConfig {
  url: string;
}
