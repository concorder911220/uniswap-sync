import { Injectable } from '@nestjs/common';
import { GraphqlClientService } from '../graphql-client/graphql-client.service';
import { CreatePoolDto } from '../database/repositories/dto/pool.dto';
import { Cron } from '@nestjs/schedule';
import { PoolTempRepository } from '../database/repositories/poolTemp.repository';
import { Tick } from '../database/entities/tick.entity';
import { TickRepository } from '../database/repositories/tick.repository';

@Injectable()
export class UniswapService {
  constructor(
    private readonly graphqlClient: GraphqlClientService,
    private readonly poolTempRepository: PoolTempRepository,
    private readonly tickRepository: TickRepository,
  ) {}

  async onModuleInit() {
    console.log('🚀 Server started: Running initial Uniswap pool data sync...');
    await this.handleCron(); // Run cron job immediately when server starts
  }
  async getPools(
    skip: number = 0,
    first: number = 1000,
  ): Promise<CreatePoolDto[]> {
    const query = `
     query ($skip: Int, $first: Int) {
        pools(skip: $skip, first: $first) {
          tick
          token0 {
            symbol
            id
            decimals
          }
          token1 {
            symbol
            id
            decimals
          }
          token0Price
          feeTier
          sqrtPrice
          liquidity
        }
      }

    `;
    const data = await this.graphqlClient.fetchData(query, skip, first);

    return data.pools;
  }

  async getTicks(
    skip: number = 0,
    first: number = 1000,
    lastTime: number,
  ): Promise<Tick[]> {
    const query = `
     query ($skip: Int, $first: Int, $lastTime: BigInt) {
      ticks(skip: $skip, first: $first, orderBy: createdAtTimestamp, orderDirection: asc, where: {createdAtTimestamp_gt: $lastTime}) {
        createdAtTimestamp
        tickIdx
        poolAddress
        liquidityGross
        liquidityNet
      }
    }

    `;

    const data = await this.graphqlClient.fetchData(
      query,
      skip,
      first,
      lastTime,
    );
    return data.ticks;
  }

  async savePoolsToDatabase(): Promise<void> {
    let allPools: CreatePoolDto[] = [];
    let skip = 0;
    const batchSize = 1000;
    while (true) {
      console.log(`Fetching pools with skip: ${skip}...`);
      const pools = await this.getPools(skip, batchSize);
      if (!pools || pools.length === 0) {
        break; // Exit loop
      }

      await this.poolTempRepository.savePools(pools);
      allPools = allPools.concat(pools);
      skip += batchSize;
    }

    console.log(`Total pools fetched: ${allPools.length}`);
    if (allPools.length > 0) {
      await this.poolTempRepository.swapTable(allPools.length);
    }
  }

  async saveTicksToDatabase(): Promise<void> {
    let allTicks: Tick[] = [];
    let skip = 0;
    const batchSize = 1000;
    const now = new Date();

    const currentTimestamp = Math.floor(now.getTime() / 1000);

    let thirtyMinutesAgoTimestamp = currentTimestamp - 30 * 60;
    const lastTick = await this.tickRepository.findLastOne();
    console.log(lastTick);
    if (lastTick.length > 0) {
      thirtyMinutesAgoTimestamp = Number(lastTick[0].createdAtTimestamp);
    }
    while (true) {
      console.log(`Fetching pools with skip: ${skip}...`);
      const ticks = await this.getTicks(
        skip,
        batchSize,
        thirtyMinutesAgoTimestamp,
      );
      if (!ticks || ticks.length === 0) break;
      allTicks = allTicks.concat(ticks);
      skip += batchSize;
    }

    if (allTicks.length === 0) {
      console.log('No new ticks found, skipping save.');
      return; // 🚀 Prevents calling saveTicks with empty data
    }

    console.log(`Total pools fetched: ${allTicks.length}`);
    await this.tickRepository.saveTicks(allTicks);
  }

  @Cron('0 */30 * * * *')
  async handleCron() {
    console.log('Running periodic Uniswap pool data sync...');
    await this.savePoolsToDatabase();
    await this.saveTicksToDatabase();
  }
}
