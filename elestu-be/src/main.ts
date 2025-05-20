import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as morgan from 'morgan';
import * as path from 'path';
import * as fs from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    logger.log('Iniciando aplicación...');

    try {
        // Cambia el tipo de app a NestExpressApplication
        const app = await NestFactory.create<NestExpressApplication>(AppModule);
        logger.log('Módulo principal creado');

        app.use(bodyParser.json({ limit: '10mb' }));
        app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
        app.use(compression());
        app.use(morgan('dev'));

        app.use(
            session({
                secret: '123456',
                resave: false,
                saveUninitialized: false,
                cookie: {
                    secure: process.env.NODE_ENV === 'production',
                    httpOnly: true,
                    maxAge: 1000 * 60 * 60 * 24,
                },
            }),
        );
        logger.log('Middleware de sesión configurado');

        app.enableCors({
            origin: ['http://localhost:8000', 'http://127.0.0.1:8000', 'http://localhost:3000'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            credentials: true,
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cookie', 'Origin', 'X-Requested-With'],
            exposedHeaders: ['Set-Cookie'],
        });
        logger.log('CORS configurado');

        app.useGlobalPipes(new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: false,
        }));
        logger.log('Pipe de validación global configurado');

        app.setGlobalPrefix('api', {
            exclude: [''],
        });
        logger.log('Prefijo global configurado');

        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        // Ahora sí puedes usar useStaticAssets
        app.useStaticAssets(uploadDir, {
            prefix: '/uploads/',
        });
        logger.log('Middleware para servir imágenes estáticas configurado');

        const port = process.env.PORT || 3000;
        await app.listen(port);
        logger.log(`🚀 Servidor corriendo en: http://localhost:${port}`);
    } catch (error) {
        logger.error(`Error al iniciar la aplicación: ${error.message}`, error.stack);
        throw error;
    }
}

bootstrap()
    .then(() => console.log('Aplicación iniciada correctamente'))
    .catch(error => console.error(`Error crítico: ${error.message}`));
