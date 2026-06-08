import 'dotenv/config'

export const config = {
  databaseUrl:
    process.env.DATABASE_URL ??
    'postgres://wellness:wellness@localhost:5432/wellness',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-not-for-production',
  port: Number(process.env.PORT ?? 4000),
}
