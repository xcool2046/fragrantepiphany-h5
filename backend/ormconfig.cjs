const path = require('path')
require('dotenv').config()
const { DataSource } = require('typeorm')

const baseDir = __dirname && __dirname !== '.' ? __dirname : process.cwd()

module.exports = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [path.join(baseDir, 'dist/src/**/*.entity.js')],
  migrations: [path.join(baseDir, 'dist/src/migrations/*.js')],
  synchronize: false,
})
