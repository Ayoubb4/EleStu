import { DataSource } from 'typeorm';
import { User } from './users/user.entity';
import { Service } from './services/service.entity';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'EleStuAdmin',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'EleStu',
    entities: [User, Service],
    migrations: ['src/migrations/**/*.ts'],
    synchronize: false,
    logging: true,
});
