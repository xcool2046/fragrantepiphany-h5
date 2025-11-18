import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import ormconfig from '../ormconfig';
import { Interpretation } from './entities/interpretation.entity';
import { Order } from './entities/order.entity';
import { User } from './entities/user.entity';
import { PayModule } from './pay/pay.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...ormconfig.options,
        entities: [Interpretation, Order, User],
      }),
    }),
    PayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
