// src/data-source.ts
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config(); // Carga .env para que funcione en tu PC

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',

    // Usamos la DATABASE_URL directamente.
    // En tu PC, la leerá de tu .env. En Render, la tomará del entorno.
    url: process.env.DATABASE_URL,

    // SSL es necesario para Render. Se activa si la URL contiene 'onrender.com'
    ssl: process.env.DATABASE_URL?.includes('onrender.com')
        ? { rejectUnauthorized: false }
        : false,

    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],

    synchronize: true,
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;