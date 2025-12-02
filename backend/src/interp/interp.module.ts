import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interpretation } from '../entities/interpretation.entity';
import { Card } from '../entities/card.entity';
import { InterpretationService } from './interp.service';
import { InterpretationController } from './interp.controller';
import { DrawService } from './draw.service';
import { PayModule } from '../pay/pay.module';

@Module({
  imports: [TypeOrmModule.forFeature([Interpretation, Card]), PayModule],
  providers: [InterpretationService, DrawService],
  controllers: [InterpretationController],
  exports: [InterpretationService],
})
export class InterpModule {}
