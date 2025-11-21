import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../entities/order.entity';
import { Question } from '../entities/question.entity';
import { Card } from '../entities/card.entity';
import { Rule } from '../entities/rule.entity';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({ dest: './uploads', limits: { fileSize: 10 * 1024 * 1024 } }),
    TypeOrmModule.forFeature([Order, Question, Card, Rule]),
  ],
  controllers: [AdminController],
})
export class AdminModule {}
