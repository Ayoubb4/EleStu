import { DataSource } from 'typeorm';
import { User } from './users/user.entity';
import { Service } from './services/service.entity';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User, Service],
    migrations: ['src/migrations/**/*.ts'],
    synchronize: false,
    logging: true,
    ssl: {
        rejectUnauthorized: false,
    },
});
