import 'dotenv/config'
import { createRequire } from 'module'
import { DataSource } from 'typeorm'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const ormconfig = require('../ormconfig.cjs')
const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function ensureSchema(ds) {
  await ds.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`)
  await ds.query(`CREATE TABLE IF NOT EXISTS "tarot_interpretations" (
    id SERIAL PRIMARY KEY,
    card_name varchar NOT NULL,
    category varchar NOT NULL,
    position varchar NOT NULL,
    language varchar NOT NULL,
    summary text NOT NULL,
    interpretation text,
    action text,
    future text,
    recommendation jsonb
  )`)
  await ds.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_interp_unique ON tarot_interpretations(card_name, category, position, language)`)
  await ds.query(`CREATE TABLE IF NOT EXISTS "orders" (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    amount integer NOT NULL,
    currency varchar NOT NULL,
    price_id varchar,
    status varchar NOT NULL DEFAULT 'pending',
    stripe_session_id varchar,
    payment_intent_id varchar,
    metadata jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT now()
  )`)
  await ds.query(`CREATE TABLE IF NOT EXISTS "users" (
    id SERIAL PRIMARY KEY,
    username varchar UNIQUE NOT NULL,
    password_hash varchar NOT NULL
  )`)
}

async function run() {
  const dataSource = new DataSource({
    ...(ormconfig.options ?? ormconfig),
    entities: [path.join(__dirname, '../dist/src/**/*.entity.js')],
    migrations: [path.join(__dirname, '../dist/src/migrations/*{.js}')],
  })
  console.log('Using DB:', dataSource.options.url)
  await dataSource.initialize()
  await ensureSchema(dataSource)
  console.log('Schema ensured')
  await dataSource.runMigrations()
  console.log('Migrations done')

  const repo = dataSource.getRepository('Interpretation')
  const raw = fs.readFileSync(path.join(__dirname, '../../sample-data/cards-example.json'), 'utf-8')
  const data = JSON.parse(raw)
  await repo.save(repo.create(data))
  console.log('Seed done:', data.length)

  await dataSource.destroy()
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
