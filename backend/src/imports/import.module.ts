import { Module } from '@nestjs/common';
import { ImportController } from './import.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interpretation } from '../entities/interpretation.entity';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({ limits: { fileSize: 5 * 1024 * 1024 } }),
    TypeOrmModule.forFeature([Interpretation]),
  ],
  controllers: [ImportController],
})
export class ImportModule {}
