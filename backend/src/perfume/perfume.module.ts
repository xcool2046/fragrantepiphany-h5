import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Perfume } from '../entities/perfume.entity';
import { Card } from '../entities/card.entity';
import { PerfumeService } from './perfume.service';
import { PerfumeController } from './perfume.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Perfume, Card])],
  controllers: [PerfumeController],
  providers: [PerfumeService],
})
export class PerfumeModule {}
