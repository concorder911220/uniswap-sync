import { Module } from '@nestjs/common';
import { UniswapService } from './uniswap.service';
import { UniswapController } from './uniswap.controller';
import { GraphqlClientModule } from '../graphql-client/graphql-client.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [GraphqlClientModule, DatabaseModule],
  controllers: [UniswapController],
  providers: [UniswapService],
})
export class UniswapModule {}
