import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayService } from './pay.service';
import { PayController } from './pay.controller';
import { Order } from '../entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  providers: [PayService],
  controllers: [PayController],
})
export class PayModule {}
