import { Test, TestingModule } from '@nestjs/testing';
import { UniswapService } from './uniswap.service';
import { GraphqlClientService } from '../graphql-client/graphql-client.service';
import { PoolTempRepository } from '../database/repositories/poolTemp.repository';
import { TickRepository } from '../database/repositories/tick.repository';
import { CreatePoolDto } from '../database/repositories/dto/pool.dto';
import { Tick } from '../database/entities/tick.entity';

describe('UniswapService', () => {
  let uniswapService: UniswapService;
  let graphqlClientService: GraphqlClientService;
  let poolTempRepository: PoolTempRepository;
  let tickRepository: TickRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniswapService,
        {
          provide: GraphqlClientService,
          useValue: {
            fetchData: jest.fn(),
          },
        },
        {
          provide: PoolTempRepository,
          useValue: {
            savePools: jest.fn(),
            swapTable: jest.fn(),
          },
        },
        {
          provide: TickRepository,
          useValue: {
            saveTicks: jest.fn(),
            findLastOne: jest.fn(),
          },
        },
      ],
    }).compile();

    uniswapService = module.get<UniswapService>(UniswapService);
    graphqlClientService =
      module.get<GraphqlClientService>(GraphqlClientService);
    poolTempRepository = module.get<PoolTempRepository>(PoolTempRepository);
    tickRepository = module.get<TickRepository>(TickRepository);
  });

  it('should be defined', () => {
    expect(uniswapService).toBeDefined();
  });

  describe('getPools', () => {
    it('should fetch and return pool data', async () => {
      const mockPools: CreatePoolDto[] = [
        {
          tick: '1',
          token0: { symbol: 'ETH', id: '0xToken0', decimals: 18 },
          token1: { symbol: 'USDC', id: '0xToken1', decimals: 6 },
          feeTier: '3000',
          sqrtPrice: '12345678',
          liquidity: '100000',
        },
      ];

      graphqlClientService.fetchData = jest
        .fn()
        .mockResolvedValue({ pools: mockPools });

      const result = await uniswapService.getPools(0, 100);

      expect(graphqlClientService.fetchData).toHaveBeenCalledWith(
        expect.any(String),
        0,
        100,
      );
      expect(result).toEqual(mockPools);
    });

    it('should return an empty array if no pools are found', async () => {
      graphqlClientService.fetchData = jest
        .fn()
        .mockResolvedValue({ pools: [] });

      const result = await uniswapService.getPools(0, 100);

      expect(graphqlClientService.fetchData).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      graphqlClientService.fetchData = jest
        .fn()
        .mockRejectedValue(new Error('GraphQL Error'));

      await expect(uniswapService.getPools(0, 100)).rejects.toThrow(
        'GraphQL Error',
      );
      expect(graphqlClientService.fetchData).toHaveBeenCalled();
    });
  });

  describe('getTicks', () => {
    it('should fetch and return tick data', async () => {
      const mockTicks: Tick[] = [
        {
          id: 1,
          createdAtTimestamp: '1700000000',
          tickIdx: '1',
          poolAddress: '0xPoolAddress',
          liquidityGross: '5000',
          liquidityNet: '3000',
        },
      ];

      graphqlClientService.fetchData = jest
        .fn()
        .mockResolvedValue({ ticks: mockTicks });

      const result = await uniswapService.getTicks(0, 100, 1699999999);

      expect(graphqlClientService.fetchData).toHaveBeenCalledWith(
        expect.any(String),
        0,
        100,
        1699999999,
      );
      expect(result).toEqual(mockTicks);
    });

    it('should return an empty array if no ticks are found', async () => {
      graphqlClientService.fetchData = jest
        .fn()
        .mockResolvedValue({ ticks: [] });

      const result = await uniswapService.getTicks(0, 100, 1699999999);

      expect(graphqlClientService.fetchData).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      graphqlClientService.fetchData = jest
        .fn()
        .mockRejectedValue(new Error('GraphQL Error'));

      await expect(uniswapService.getTicks(0, 100, 1699999999)).rejects.toThrow(
        'GraphQL Error',
      );
      expect(graphqlClientService.fetchData).toHaveBeenCalled();
    });
  });

  describe('savePoolsToDatabase', () => {
    it('should fetch and save pools to the database', async () => {
      const mockPools: CreatePoolDto[] = [
        {
          tick: '1',
          token0: { symbol: 'ETH', id: '0xToken0', decimals: 18 },
          token1: { symbol: 'USDC', id: '0xToken1', decimals: 6 },
          feeTier: '3000',
          sqrtPrice: '12345678',
          liquidity: '100000',
        },
      ];

      jest
        .spyOn(uniswapService, 'getPools')
        .mockResolvedValueOnce(mockPools)
        .mockResolvedValueOnce([]);
      jest.spyOn(poolTempRepository, 'savePools').mockResolvedValue(undefined);
      jest.spyOn(poolTempRepository, 'swapTable').mockResolvedValue(undefined);

      await uniswapService.savePoolsToDatabase();

      expect(uniswapService.getPools).toHaveBeenCalledTimes(2);
      expect(poolTempRepository.savePools).toHaveBeenCalledWith(mockPools);
      expect(poolTempRepository.swapTable).toHaveBeenCalledWith(
        mockPools.length,
      );
    });

    it('should handle empty pool data gracefully', async () => {
      jest.spyOn(uniswapService, 'getPools').mockResolvedValue([]); // Mock empty response

      const savePoolsSpy = jest.spyOn(poolTempRepository, 'savePools');
      const swapTableSpy = jest.spyOn(poolTempRepository, 'swapTable');

      await uniswapService.savePoolsToDatabase();

      expect(uniswapService.getPools).toHaveBeenCalledTimes(1);
      expect(savePoolsSpy).not.toHaveBeenCalled(); // ✅ Should NOT be called
      expect(swapTableSpy).not.toHaveBeenCalled(); // ✅ Should NOT be called
    });

    it('should handle errors during data fetching', async () => {
      jest
        .spyOn(uniswapService, 'getPools')
        .mockRejectedValue(new Error('GraphQL Error'));

      await expect(uniswapService.savePoolsToDatabase()).rejects.toThrow(
        'GraphQL Error',
      );

      expect(uniswapService.getPools).toHaveBeenCalledTimes(1);
      expect(poolTempRepository.savePools).not.toHaveBeenCalled();
      expect(poolTempRepository.swapTable).not.toHaveBeenCalled();
    });
  });

  describe('saveTicksToDatabase', () => {
    let saveTicksSpy: jest.SpyInstance;
    let findLastOneSpy: jest.SpyInstance;
    let getTicksSpy: jest.SpyInstance;

    beforeEach(() => {
      saveTicksSpy = jest
        .spyOn(tickRepository, 'saveTicks')
        .mockResolvedValue(undefined);
      findLastOneSpy = jest.spyOn(tickRepository, 'findLastOne');
      getTicksSpy = jest.spyOn(uniswapService, 'getTicks');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should fetch and save ticks to the database', async () => {
      const mockTicks: Tick[] = [
        {
          id: 1,
          createdAtTimestamp: '1700000000',
          tickIdx: '1',
          poolAddress: '0xPoolAddress',
          liquidityGross: '5000',
          liquidityNet: '3000',
        },
      ];

      findLastOneSpy.mockResolvedValue([]); // No previous tick
      getTicksSpy
        .mockResolvedValueOnce(mockTicks) // First call returns data
        .mockResolvedValueOnce([]); // Second call stops the loop

      await uniswapService.saveTicksToDatabase();

      expect(getTicksSpy).toHaveBeenCalledTimes(2); // Called twice (fetch + stop)
      expect(saveTicksSpy).toHaveBeenCalledWith(mockTicks);
    });

    it('should use the last tick timestamp for fetching', async () => {
      const mockLastTick: Tick[] = [
        {
          id: 1,
          createdAtTimestamp: '1699999999',
          tickIdx: '1',
          poolAddress: '0xPoolAddress',
          liquidityGross: '5000',
          liquidityNet: '3000',
        },
      ];
      const mockTicks: Tick[] = [
        {
          id: 2,
          createdAtTimestamp: '1700000000',
          tickIdx: '2',
          poolAddress: '0xPoolAddress',
          liquidityGross: '6000',
          liquidityNet: '4000',
        },
      ];

      findLastOneSpy.mockResolvedValue(mockLastTick);
      getTicksSpy
        .mockResolvedValueOnce(mockTicks) // First fetch
        .mockResolvedValueOnce([]); // Second fetch stops loop

      await uniswapService.saveTicksToDatabase();

      expect(getTicksSpy).toHaveBeenCalledWith(0, 1000, 1699999999);
      expect(getTicksSpy).toHaveBeenCalledTimes(2); // Ensures loop stops
      expect(saveTicksSpy).toHaveBeenCalledWith(mockTicks);
    });

    it('should handle empty tick data gracefully', async () => {
      findLastOneSpy.mockResolvedValue([]); // No previous tick
      getTicksSpy.mockResolvedValue([]); // No new ticks found

      await uniswapService.saveTicksToDatabase();

      expect(saveTicksSpy).not.toHaveBeenCalled(); // No ticks to save
      expect(getTicksSpy).toHaveBeenCalledTimes(1); // Only runs once
    });
  });

  describe('handleCron', () => {
    it('should call savePoolsToDatabase and saveTicksToDatabase', async () => {
      jest.spyOn(uniswapService, 'savePoolsToDatabase').mockResolvedValue();
      jest.spyOn(uniswapService, 'saveTicksToDatabase').mockResolvedValue();

      await uniswapService.handleCron();

      expect(uniswapService.savePoolsToDatabase).toHaveBeenCalled();
      expect(uniswapService.saveTicksToDatabase).toHaveBeenCalled();
    });
  });

  describe('onModuleInit', () => {
    it('should call handleCron on module initialization', async () => {
      jest.spyOn(uniswapService, 'handleCron').mockResolvedValue();

      await uniswapService.onModuleInit();

      expect(uniswapService.handleCron).toHaveBeenCalled();
    });
  });
});
