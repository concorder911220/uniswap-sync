import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tick } from '../entities/tick.entity';

@Injectable()
export class TickRepository {
  constructor(
    @InjectRepository(Tick)
    private readonly tickRepository: Repository<Tick>,
  ) {}

  async saveTicks(tickData: Tick[]) {
    const ticks = tickData.map((dto: Tick) =>
      this.tickRepository.create({
        createdAtTimestamp: dto.createdAtTimestamp,
        tickIdx: dto.tickIdx,
        poolAddress: dto.poolAddress,
        liquidityGross: dto.liquidityGross,
        liquidityNet: dto.liquidityNet,
      }),
    );
    await this.tickRepository.save(ticks);
  }

  async findLastOne() {
    return await this.tickRepository.find({
      order: { id: 'DESC' },
      take: 1,
    });
  }
}
