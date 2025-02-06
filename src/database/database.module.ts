import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pool } from './entities/pool.entity';
import { PoolRepository } from './repositories/pool.repository';
import { PoolTemp } from './entities/poolTemp.entity';
import { PoolTempRepository } from './repositories/poolTemp.repository';
import { Tick } from './entities/tick.entity';
import { TickRepository } from './repositories/tick.repository';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'Smartguy(&123',
      database: 'uniswap_db',
      entities: [Pool, PoolTemp, Tick],
      synchronize: false, // Don't use in production
    }),
    TypeOrmModule.forFeature([Pool, PoolTemp, Tick]),
  ],
  providers: [PoolRepository, PoolTempRepository, TickRepository],
  exports: [PoolRepository, PoolTempRepository, TickRepository],
})
export class DatabaseModule {}
