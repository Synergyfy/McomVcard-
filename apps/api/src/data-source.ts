import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
import { join } from 'path'

dotenv.config()

const currentDir = __dirname

const isProd = process.env.NODE_ENV === 'production'

export const appDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USERNAME || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_NAME || 'mcomvcard',
  entities: [join(currentDir, '/**/*.entity{.ts,.js}')],
  migrations: [join(currentDir, '/migrations/*{.ts,.js}')],
  // Never enable synchronize in production; allow opt-in in non-prod via TYPEORM_SYNC=true
  synchronize: isProd ? false : process.env.TYPEORM_SYNC === 'true',
})
