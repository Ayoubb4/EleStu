// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as compression from 'compression';
import * as morgan from 'morgan';
import * as path from 'path';
import * as fs from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    logger.log('Iniciando aplicación NestJS...');

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        rawBody: true,
    });
    logger.log('Instancia de NestExpressApplication creada.');

    // --- CONFIGURACIÓN DE CORS DEFINITIVA Y REFORZADA ---
    const whitelist = [
        'http://localhost:8000',      // Tu frontend en desarrollo
        'https://ele-stu.vercel.app',  // Tu frontend desplegado en Vercel
        // --- AÑADIDO: Puedes añadir más dominios aquí en el futuro si es necesario ---
    ];

    app.enableCors({
        origin: function (origin, callback) {
            if (!origin || whitelist.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                logger.error(`Origen no permitido por CORS: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        // --- AÑADIDO: Opciones adicionales para robustecer la configuración ---
        // Especifica los encabezados que el frontend puede enviar. 'Authorization' es clave para los tokens.
        allowedHeaders: 'Content-Type, Accept, Authorization',
        // Nos aseguramos de que las peticiones de pre-vuelo (OPTIONS) sean manejadas correctamente por NestJS.
        preflightContinue: false,
        optionsSuccessStatus: 204, // Un estándar para respuestas exitosas a peticiones OPTIONS.
    });
    logger.log('CORS configurado para permitir orígenes específicos y manejar pre-vuelo.');
    // --- FIN DE LA MODIFICACIÓN ---

    app.use(express.json({
        limit: '50mb',
        verify: (req: any, res, buf) => { req.rawBody = buf; }
    }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    logger.log('Middlewares de parseo de cuerpo configurados.');

    app.use(compression());
    app.use(morgan('dev'));

    app.use(
        session({
            secret: process.env.SESSION_SECRET || '123456',
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24, // 1 día
            },
        }),
    );
    logger.log('Middleware de sesión configurado.');

    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
    }));
    logger.log('Pipe de validación global configurado.');

    app.setGlobalPrefix('api');
    logger.log("Prefijo global 'api' configurado para las rutas.");

    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        logger.log(`Directorio de subidas creado en: ${uploadDir}`);
    }
    app.useStaticAssets(uploadDir, {
        prefix: '/uploads/',
    });
    logger.log("Middleware para servir archivos estáticos desde '/uploads/' configurado.");

    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`🚀 Servidor NestJS corriendo en el puerto: ${port}`);
}

bootstrap()
    .catch(error => {
        const criticalLogger = new Logger('BootstrapCriticalError');
        criticalLogger.error(`Error crítico al iniciar la aplicación: ${error.message}`, error.stack);
        process.exit(1);
    });