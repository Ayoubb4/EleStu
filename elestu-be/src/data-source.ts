// src/data-source.ts
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

// Cargar variables de .env para que funcione en tu PC
config();

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',

    // Usamos la DATABASE_URL directamente.
    // En tu PC, la leerá de tu .env. En Render, la tomará del entorno que configuraste.
    url: process.env.DATABASE_URL,

    // SSL es necesario para Render. Se activa si la URL contiene 'onrender.com'
    ssl: process.env.DATABASE_URL?.includes('onrender.com')
        ? { rejectUnauthorized: false }
        : false,

    // Rutas robustas para encontrar tus entidades y migraciones
    // tanto en desarrollo (.ts) como en producción (.js en la carpeta /dist)
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],

    // Las migraciones manejarán la estructura de la base de datos
    synchronize: false,
};

// Creamos y exportamos la instancia de DataSource para el CLI de TypeORM
const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;