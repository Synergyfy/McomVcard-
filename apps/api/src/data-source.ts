import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
import { join } from 'path'

dotenv.config()

const cwd = process.cwd()

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'mcomvcard',
  entities: [join(cwd, 'src', '/**/*.entity{.ts,.js}')],
  migrations: [join(cwd, 'src', '/migrations/*{.ts,.js}')],
  synchronize: process.env.TYPEORM_SYNC === 'true',
})
