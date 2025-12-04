
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function bootstrap() {
  try {
    console.log('Initializing NestJS application...');
    const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log', 'debug', 'verbose'] });
    console.log('Application initialized successfully.');
    await app.close();
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

bootstrap();
