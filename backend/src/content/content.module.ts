import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ContentController } from './content.controller'
import { Question } from '../entities/question.entity'
import { Card } from '../entities/card.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Question, Card])],
  controllers: [ContentController],
})
export class ContentModule {}
