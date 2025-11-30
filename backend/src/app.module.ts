import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import ormconfig from '../ormconfig';
import { Interpretation } from './entities/interpretation.entity';
import { Order } from './entities/order.entity';
import { User } from './entities/user.entity';
import { Question } from './entities/question.entity';
import { Card } from './entities/card.entity';
import { Perfume } from './entities/perfume.entity';
import { PayModule } from './pay/pay.module';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { InterpModule } from './interp/interp.module';
import { QuestionnaireModule } from './questionnaire/questionnaire.module';
import { ImportModule } from './imports/import.module';
import { AdminModule } from './admin/admin.module';
import { ContentModule } from './content/content.module';
import { PerfumeModule } from './perfume/perfume.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...ormconfig.options,
        entities: [Interpretation, Order, User, Question, Card, Perfume],
        migrations: [],
      }),
    }),
    PayModule,
    AuthModule,
    InterpModule,
    QuestionnaireModule,
    ImportModule,
    AdminModule,
    ContentModule,
    PerfumeModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}
