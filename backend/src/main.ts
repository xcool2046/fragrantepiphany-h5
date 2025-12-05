import { NestFactory } from '@nestjs/core';
// Trigger restart
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { IncomingMessage } from 'http';
import { join } from 'path';
import express from 'express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );
  app.use(
    json({
      limit: '20mb',
      verify: (req: IncomingMessage & { rawBody?: Buffer }, _res, buf) => {
        req.rawBody = buf;
        // Log large uploads for debugging
        if (buf.length > 1024 * 1024) {
             console.log(`[Upload] Receiving large body: ${(buf.length / 1024 / 1024).toFixed(2)} MB`);
        }
      },
    }),
  );
  app.use(urlencoded({ extended: true, limit: '20mb' }));
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  });
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
