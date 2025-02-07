import { Injectable } from '@nestjs/common';
import { Pool } from '../entities/pool.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreatePoolEetherDto } from './dto/pool.dto';

@Injectable()
export class PoolRepository {
  constructor(
    @InjectRepository(Pool)
    private readonly poolRepository: Repository<Pool>,
    private readonly dataSource: DataSource,
  ) {}

  async savePool(pool: CreatePoolEetherDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();
      // Set the isolation level to Serializable
      await queryRunner.manager.query(
        'SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;',
      );

      const existingPool = await queryRunner.manager.findOne(Pool, {
        where: {
          token0: pool.token0,
          token1: pool.token1,
        },
      });

      if (existingPool) {
        await queryRunner.manager.update(Pool, existingPool.id, pool);
      } else {
        await queryRunner.manager.save(Pool, pool);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      console.error('❌ Error saving pool:', error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
