import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pool } from './entities/pool.entity';
import { PoolRepository } from './repositories/pool.repository';
import { PoolTemp } from './entities/poolTemp.entity';
import { PoolTempRepository } from './repositories/poolTemp.repository';
import { Tick } from './entities/tick.entity';
import { TickRepository } from './repositories/tick.repository';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT ? +process.env.DATABASE_PORT : 5432,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [Pool, PoolTemp, Tick],
      synchronize: false, // Don't use in production
    }),
    TypeOrmModule.forFeature([Pool, PoolTemp, Tick]),
  ],
  providers: [PoolRepository, PoolTempRepository, TickRepository],
  exports: [PoolRepository, PoolTempRepository, TickRepository],
})
export class DatabaseModule {}
