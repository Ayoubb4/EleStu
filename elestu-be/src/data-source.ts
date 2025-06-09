// src/data-source.ts
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

// Cargar variables de .env para que funcione en tu PC
config();

// Esta variable nos dirá si estamos en el entorno de Render
// Render siempre define esta variable de entorno en sus servicios
const isProduction = !!process.env.RENDER_INTERNAL_HOSTNAME;

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',

    // Leemos las variables de entorno que configuraste
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    // --- LA SOLUCIÓN ESTÁ AQUÍ ---
    // La opción ssl es CRUCIAL para Render. La activamos si estamos en producción.
    ssl: isProduction
        ? { rejectUnauthorized: false }
        : false,

    // TypeORM necesita saber dónde encontrar los archivos compilados en producción
    // Esta configuración funciona para .ts (local) y .js (producción en /dist)
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],

    // En producción (Render), NUNCA usar synchronize: true.
    // En local, lo activamos para que sea más fácil desarrollar.
    synchronize: !isProduction,
};

// Creamos y exportamos la instancia de DataSource
const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
