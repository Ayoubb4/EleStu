// src/data-source.ts
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

// Cargar variables de .env (esto es principalmente para tu desarrollo local)
config();

// Esta variable nos dirá si estamos en el entorno de Render
const isProduction = process.env.NODE_ENV === 'production';

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',

    // Para Render, es más robusto usar las variables individuales que te da
    // en lugar de la URL completa, ya que el script de CLI a veces no las procesa igual.
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    // La opción ssl es CRUCIAL para Render. Se activa solo en producción.
    ssl: isProduction
        ? { rejectUnauthorized: false }
        : false,

    // TypeORM necesita saber dónde encontrar los archivos compilados en producción
    // Esta configuración funciona tanto para .ts (en desarrollo) como para .js (en producción en /dist)
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],

    // Muy importante: NUNCA usar synchronize: true en producción.
    synchronize: !isProduction,
};

// Creamos y exportamos la instancia de DataSource para que la use el CLI de TypeORM
const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
