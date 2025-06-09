// src/data-source.ts
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

// Cargar variables de .env (esto es para tu desarrollo local)
config();

// Esta variable nos dirá si estamos en el entorno de Render
const isProduction = process.env.NODE_ENV === 'production';

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',

    // Leemos las variables de entorno que configuraste en Render (y en tu .env local)
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    // --- LA SOLUCIÓN ESTÁ AQUÍ ---
    // La opción ssl es CRUCIAL para Render. La activamos solo en producción.
    ssl: isProduction
        ? { rejectUnauthorized: false }
        : false,

    // TypeORM necesita saber dónde encontrar los archivos compilados en producción
    // Esta configuración funciona para .ts (local) y .js (producción en /dist)
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],

    // NUNCA usar synchronize: true en producción.
    synchronize: !isProduction,
};

// Creamos y exportamos la instancia de DataSource para que la use el CLI de TypeORM
const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;