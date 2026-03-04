export const ENV = {
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY,
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL,
  ownerOpenId: process.env.OWNER_OPEN_ID,
  ownerName: process.env.OWNER_NAME,
  jwtSecret: process.env.JWT_SECRET,
  oauthServerUrl: process.env.OAUTH_SERVER_URL,
  databaseUrl: process.env.DATABASE_URL,
} as const;
