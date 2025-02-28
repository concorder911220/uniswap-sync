import { Controller, Get, Post, Query } from '@nestjs/common';
import { UniswapService } from './uniswap.service';

@Controller('uniswap')
export class UniswapController {
  constructor(private readonly uniswapService: UniswapService) {}

  @Get('pools')
  async getPool() {
    await this.uniswapService.savePoolsToDatabase();
    return { message: 'Pools saved to database' };
  }

  @Get('ticks')
  async getTicks() {
    return this.uniswapService.saveTicksToDatabase();
  }

  @Get('pool-info')
  async getPoolInfo(@Query('poolId') poolId: string) {
    return this.uniswapService.getPoolInfo(poolId);
  }
}
