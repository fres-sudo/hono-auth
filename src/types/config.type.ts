export const config: Config = {
  isProduction: process.env.NODE_ENV === "production",
  api: {
    origin: process.env.ORIGIN ?? "",
  },
  postgres: {
    url: process.env.DATABASE_URL ?? "",
    localUrl: process.env.DATABASE_URL_LOCAL ?? "",
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "your_access_secret",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "your_refresh_secret",
    accessExpiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    refreshExpiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
    refreshExpiresInDate: new Date(Date.now() + 60 * 60 * 24 * 30 * 1000), // 30 days
  },
};

interface Config {
  isProduction: boolean;
  api: ApiConfig;
  postgres: PostgresConfig;
  jwt: JwtConfig;
}

interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
  refreshExpiresInDate: Date;
}

interface ApiConfig {
  origin: string;
}

interface PostgresConfig {
  url: string;
  localUrl: string;
}
