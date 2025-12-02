import 'dotenv/config'
import { DataSource } from 'typeorm'
import ormconfig from '../ormconfig'
import { Interpretation } from '../src/entities/interpretation.entity'
import fs from 'fs'
import path from 'path'

async function main() {
  const ds = new DataSource({
    ...(ormconfig.options as any),
    entities: [Interpretation],
  })
  await ds.initialize()
  const repo = ds.getRepository(Interpretation)
  const filePath = path.resolve(__dirname, '../../sample-data/cards-example.json')
  const raw = fs.readFileSync(filePath, 'utf-8')
  const data = JSON.parse(raw)
  const entities = repo.create(data)
  await repo.save(entities)
  await ds.destroy()
  console.log('Seeded interpretations:', entities.length)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
