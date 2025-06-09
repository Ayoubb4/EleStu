// src/data-source.ts
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

// Cargar variables de .env para que funcione en tu PC
config();

// --- Lógica de Detección de Entorno Mejorada ---
// Render define la variable 'RENDER' en su entorno de build y runtime.
// Usaremos esto para determinar si estamos en producción. Es más fiable.
const isProduction = process.env.RENDER === 'true';

// --- Añadimos Logs para Depurar la Configuración ---
console.log('--- Configuración de DataSource ---');
console.log(`¿Es entorno de Producción (Render)? -> ${isProduction}`);
console.log(`DB_HOST: ${process.env.DB_HOST}`);
console.log(`DB_USER: ${process.env.DB_USER}`);
console.log(`DB_NAME: ${process.env.DB_NAME}`);
console.log('---------------------------------');
// ----------------------------------------------------

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',

    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    // La opción ssl es CRUCIAL para Render. La activamos si estamos en producción.
    ssl: isProduction
        ? { rejectUnauthorized: false }
        : false,

    // Rutas robustas para encontrar tus entidades y migraciones
    // tanto en desarrollo (.ts) como en producción (.js en la carpeta /dist)
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],

    // Sincronizar solo en desarrollo, NUNCA en producción.
    synchronize: !isProduction,
};

// Creamos y exportamos la instancia de DataSource para el CLI de TypeORM
const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;