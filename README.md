# Uniswap Data Synchronization Backend

This is a NestJS backend application that periodically fetches data from the Uniswap V3 subgraph and stores it in a PostgreSQL database.

## Features

- **Periodic Data Sync**: Fetches pool and tick data from the Uniswap V3 subgraph every 30 minutes.
- **Database Integration**: Stores synchronized data in a PostgreSQL database using TypeORM.
- **GraphQL Client**: Uses Apollo Client to interact with the Uniswap subgraph.
- **Scalable Architecture**: Designed with modularity and scalability in mind.
- **Unit Tests**: Includes unit tests for services and controllers.

## Requirements

- Node.js (version 18 or higher)
- PostgreSQL (version 14 or higher)
- NestJS CLI
- TypeScript
- TypeORM
- Ethers.js

## Setup & Run

### Local

```bash
npm install
cp .env-example .env # and update values
npm run build
npm run migration:run
npm run start:dev
```

### Docker

```bash
docker compose up
```

## Architecture

- **NestJS Framework**: Used for building the backend application due to its modular architecture and ease of testing.
- **PostgreSQL**: Chosen for its robustness, support for complex queries, and concurrency features.

## Database Structure

- **Pools Table**: Stores pool data (id, token0, token1, liquidity, etc.)
- **Ticks Table**: Stores tick data associated with each pool (id, poolId, tick, price, etc.)
- **Temp Tables**: Used for staging data before swapping to main tables for efficient updates.

## Concurrency Handling

To manage concurrency issues, the application implements a database isolation level of SERIALIZABLE. This prevents dirty reads and ensures that the data remains consistent during updates.

## Bonus Features

- **Ethers.js Integration**: The application collects data directly from the Ethereum blockchain, providing a backup data source.
- **Performance Optimization**: Utilizes temporary tables for bulk data updates to minimize locking and improve write performance.

## Unit Tests

Unit tests can be found in the `test` directory. Run them using:

```bash
npm run test
```
