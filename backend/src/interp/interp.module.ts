import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interpretation } from '../entities/interpretation.entity';
import { Card } from '../entities/card.entity';
import { InterpretationService } from './interp.service';
import { InterpretationController } from './interp.controller';
import { DrawService } from './draw.service';

@Module({
  imports: [TypeOrmModule.forFeature([Interpretation, Card])],
  providers: [InterpretationService, DrawService],
  controllers: [InterpretationController],
})
export class InterpModule {}
