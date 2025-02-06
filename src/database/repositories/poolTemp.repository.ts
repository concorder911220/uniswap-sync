import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PoolTemp } from '../entities/poolTemp.entity';
import { CreatePoolDto } from './dto/pool.dto';

@Injectable()
export class PoolTempRepository {
  constructor(
    @InjectRepository(PoolTemp)
    private readonly poolTempRepository: Repository<PoolTemp>,
    private readonly dataSource: DataSource,
  ) {}

  async swapTable(length) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      console.log('🛠 Swapping tables...');
      await queryRunner.startTransaction();
      try {
        await queryRunner.manager.query('ALTER TABLE pool RENAME TO pool_old;');
        await queryRunner.manager.query(
          'ALTER TABLE pool_temp RENAME TO pool;',
        );
        await queryRunner.manager.query(
          'ALTER TABLE pool_old RENAME TO pool_temp;',
        );

        console.log('🗑 Dropping old table...');

        await queryRunner.manager.query('TRUNCATE TABLE pool_temp;');

        await queryRunner.commitTransaction();
        console.log(`✅ Successfully swapped tables with ${length} pools.`);
      } catch (swapError) {
        console.error('❌ Error during table swap:', swapError);
        await queryRunner.rollbackTransaction();
      }
    } catch (error) {
      console.error('❌ Error syncing pools:', error);
    } finally {
      await queryRunner.release();
    }
  }

  async savePools(poolData: CreatePoolDto[]) {
    const pools = poolData.map((dto: CreatePoolDto) => ({
      liquidity: dto.liquidity || '',
      sqrtPrice: dto.sqrtPrice || '',
      tick: dto.tick || '',
      feeTier: dto.feeTier || '',
      token0: dto.token0.id || '',
      token1: dto.token1.id || '',
    }));
    await this.poolTempRepository.save(pools);
  }
}
