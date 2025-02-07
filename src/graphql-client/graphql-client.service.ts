import { Injectable } from '@nestjs/common';
import { ApolloClient, gql, HttpLink, InMemoryCache } from '@apollo/client';
import fetch from 'cross-fetch';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class GraphqlClientService {
  private client: ApolloClient<any>;

  constructor() {
    const link = new HttpLink({
      uri: `https://gateway.thegraph.com/api/${process.env.UNISWAP_API_KEY}/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV`,
      fetch,
    });

    this.client = new ApolloClient({
      link,
      cache: new InMemoryCache(),
    });
  }

  async fetchData(
    query: string,
    skip: number,
    first: number,
    lastTime?: number,
  ): Promise<any> {
    try {
      const response = await this.client.query({
        query: gql(query),

        variables: { skip, first, lastTime },
        fetchPolicy: 'no-cache',
      });
      if (!response || !response.data) {
        throw new Error('Failed to fetch data: No data returned');
      }
      // console.log('Response data:', response.data);
      return response.data;
    } catch (error) {
      // console.error('Error fetching data from GraphQL API:', error.message);
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  }
}
