const path = require('path')
require('dotenv').config()
const { DataSource } = require('typeorm')

module.exports = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [path.join(__dirname, 'dist/src/**/*.entity.js')],
  migrations: [path.join(__dirname, 'dist/src/migrations/*{.js}')],
  synchronize: false,
})
