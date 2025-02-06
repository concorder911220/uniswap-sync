import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();
// console.log('called');
export const dataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'Smartguy(&123',
  database: 'uniswap_db',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/**/migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: false,
};

export default dataSourceOptions;
export const connectionSource = new DataSource(
  dataSourceOptions as DataSourceOptions,
);
