import { Module } from '@nestjs/common';
import { UniswapModule } from './uniswap/uniswap.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, UniswapModule, DatabaseModule],
})
export class AppModule {}
