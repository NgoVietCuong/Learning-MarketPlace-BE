import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
require('dotenv').config();

const dataSourceDefaultOptions = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || '',
  type: process.env.DB_CONNECTION as any || 'postgres',
  schema: 'public',
  synchronize: false,
  poolSize: 10,
  namingStrategy: new SnakeNamingStrategy(),
  entities: ['dist/src/entities/*.entity.js'],
  migrations: ['dist/src/database/migrations/*.js'],
  seeds: ['dist/src/database/seeders/*.js'],
};

export const AppDataSource = new DataSource(dataSourceDefaultOptions);
export default dataSourceDefaultOptions;
