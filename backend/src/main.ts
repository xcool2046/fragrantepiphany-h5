import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { json, urlencoded } from 'express'
import { IncomingMessage } from 'http'
import { join } from 'path'
import express from 'express'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(
    json({
      verify: (req: IncomingMessage & { rawBody?: Buffer }, _res, buf) => {
        req.rawBody = buf
      },
    }),
  )
  app.use(urlencoded({ extended: true }))
  app.enableCors()
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')))
  await app.listen(process.env.PORT ?? 3000)
}
void bootstrap()
