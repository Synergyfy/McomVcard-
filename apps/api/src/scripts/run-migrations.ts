import 'reflect-metadata'
import { appDataSource } from '../data-source'

async function run() {
  try {
    console.log('Initializing data source...')
    await appDataSource.initialize()
    console.log('Running migrations...')
    const result = await appDataSource.runMigrations()
    console.log('Migrations applied:', result.map(r => r.name))
    await appDataSource.destroy()
    process.exit(0)
  } catch (err) {
    console.error('Error during migration run:', err)
    process.exit(1)
  }
}

run()
