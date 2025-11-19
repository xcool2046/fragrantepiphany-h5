import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { json, urlencoded } from 'express'
import { IncomingMessage } from 'http'

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
  await app.listen(process.env.PORT ?? 3000)
}
void bootstrap()
