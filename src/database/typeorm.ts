import { DataSource, DataSourceOptions } from 'typeorm';

let connectionOptions: DataSourceOptions = {
  type: 'postgres', // It could be mysql, mongo, etc
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres', // postgre username
  password: 'Smartguy(&123', // postgre password
  database: 'uniswap_db', // postgre db, needs to be created before
  synchronize: false, // if true, you don't really need migrations
  logging: true,
  entities: ['dist/**/*.entity{.ts,.js}'], // where our entities reside
  migrations: ['dist/**/migrations/*{.ts,.js}'], // where our migrations reside
};

export default new DataSource({
  ...connectionOptions,
});
