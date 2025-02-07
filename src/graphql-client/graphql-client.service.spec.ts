import { Test, TestingModule } from '@nestjs/testing';
import { GraphqlClientService } from './graphql-client.service';
import { ApolloClient, gql } from '@apollo/client';

jest.mock('@apollo/client', () => {
  const actual = jest.requireActual('@apollo/client');
  return {
    ...actual,
    ApolloClient: jest.fn().mockImplementation(() => ({
      query: jest.fn(),
    })),
    InMemoryCache: jest.fn(),
    HttpLink: jest.fn(),
    gql: jest.fn(),
  };
});

describe('GraphqlClientService', () => {
  let service: GraphqlClientService;
  let apolloClientMock: jest.Mocked<ApolloClient<any>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GraphqlClientService],
    }).compile();

    service = module.get<GraphqlClientService>(GraphqlClientService);
    apolloClientMock = {
      query: jest.fn(),
    } as unknown as jest.Mocked<ApolloClient<any>>;
    (service as any).client = apolloClientMock;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch data successfully', async () => {
    const mockQuery = 'mock query';
    const mockVariables = { skip: 0, first: 10, lastTime: 1234567890 };
    const mockResponse = {
      data: { mockData: 'mockData' },
      loading: false,
      networkStatus: 7,
    };

    apolloClientMock.query.mockResolvedValueOnce(mockResponse);

    const result = await service.fetchData(
      mockQuery,
      mockVariables.skip,
      mockVariables.first,
      mockVariables.lastTime,
    );
    expect(result).toEqual(mockResponse.data);
    expect(apolloClientMock.query).toHaveBeenCalledWith({
      query: gql(mockQuery),
      variables: mockVariables,
      fetchPolicy: 'no-cache',
    });
  });

  it('should throw an error if no data is returned', async () => {
    const mockQuery = 'mock query';
    const mockVariables = { skip: 0, first: 10, lastTime: 1234567890 };

    apolloClientMock.query.mockResolvedValueOnce({
      data: null,
      loading: false,
      networkStatus: 7,
    });

    await expect(
      service.fetchData(
        mockQuery,
        mockVariables.skip,
        mockVariables.first,
        mockVariables.lastTime,
      ),
    ).rejects.toThrow('Failed to fetch data: No data returned');
  });

  it('should handle errors from the GraphQL API', async () => {
    const mockQuery = 'mock query';
    const mockVariables = { skip: 0, first: 10, lastTime: 1234567890 };
    const mockError = new Error('GraphQL API error');

    apolloClientMock.query.mockRejectedValueOnce(mockError);

    await expect(
      service.fetchData(
        mockQuery,
        mockVariables.skip,
        mockVariables.first,
        mockVariables.lastTime,
      ),
    ).rejects.toThrow(`Failed to fetch data: ${mockError.message}`);
  });
});
