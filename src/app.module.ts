import { Module } from '@nestjs/common';
import { UniswapModule } from './uniswap/uniswap.module';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    UniswapModule,
    DatabaseModule,
  ],
})
export class AppModule {}
