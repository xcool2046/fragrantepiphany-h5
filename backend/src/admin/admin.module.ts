import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Question } from '../entities/question.entity';
import { Card } from '../entities/card.entity';
import { Perfume } from '../entities/perfume.entity';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
    }),
    TypeOrmModule.forFeature([Question, Card, Perfume]),
  ],
  controllers: [AdminController],
})
export class AdminModule {}
