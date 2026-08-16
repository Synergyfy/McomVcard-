import 'reflect-metadata'
import { AppDataSource } from '../data-source'

async function run() {
  try {
    console.log('Initializing data source...')
    await AppDataSource.initialize()
    console.log('Running migrations...')
    const result = await AppDataSource.runMigrations()
    console.log('Migrations applied:', result.map(r => r.name))
    await AppDataSource.destroy()
    process.exit(0)
  } catch (err) {
    console.error('Error during migration run:', err)
    process.exit(1)
  }
}

run()
