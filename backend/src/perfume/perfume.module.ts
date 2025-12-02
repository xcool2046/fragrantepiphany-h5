import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Perfume } from '../entities/perfume.entity';
import { Card } from '../entities/card.entity';
import { PerfumeService } from './perfume.service';
import { PerfumeController } from './perfume.controller';

import { InterpModule } from '../interp/interp.module';

@Module({
  imports: [TypeOrmModule.forFeature([Perfume, Card]), InterpModule],
  controllers: [PerfumeController],
  providers: [PerfumeService],
})
export class PerfumeModule {}
