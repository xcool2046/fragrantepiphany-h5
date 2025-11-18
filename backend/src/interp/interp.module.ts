import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Interpretation } from '../entities/interpretation.entity'
import { InterpretationService } from './interp.service'
import { InterpretationController } from './interp.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Interpretation])],
  providers: [InterpretationService],
  controllers: [InterpretationController],
})
export class InterpModule {}
