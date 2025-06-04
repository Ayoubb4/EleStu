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
// bodyParser ya no es estrictamente necesario aquí si usamos express.json con verify
// import * as bodyParser from 'body-parser';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    logger.log('Iniciando aplicación NestJS...');

    // La opción rawBody: true en NestFactory.create() es la forma preferida por NestJS.
    // Si esto solo no funciona, es probable que otros middlewares de parseo interfieran.
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        rawBody: true, // Mantenemos esto por si acaso y para la intención original de NestJS.
    });
    logger.log('Instancia de NestExpressApplication creada con la opción rawBody: true.');

    // La línea específica para bodyParser.raw para el webhook se mantiene comentada,
    // ya que la solución con express.json({ verify: ... }) debería ser más global y efectiva.
    // app.use('/api/payments/webhook', bodyParser.raw({ type: 'application/json' }));
    // logger.log('Middleware bodyParser.raw específico para /api/payments/webhook (actualmente comentado).');

    // --- MODIFICACIÓN CLAVE AQUÍ ---
    // Modificamos el middleware global express.json para que guarde el rawBody.
    // Esto se aplicará a todas las rutas que manejen JSON.
    app.use(express.json({
        limit: '50mb',
        verify: (req: any, res, buf, encoding) => {
            // Guardamos el buffer crudo en req.rawBody si el buffer existe y tiene contenido.
            // Esto es crucial para la verificación de la firma de webhooks de Stripe.
            if (buf && buf.length) {
                req.rawBody = buf;
                // logger.log('Buffer crudo (rawBody) guardado en req.rawBody por express.json verify.');
            } else {
                // logger.warn('Buffer crudo no disponible o vacío en express.json verify.');
            }
        },
    }));
    logger.log('Middleware express.json configurado globalmente con la opción verify para guardar rawBody.');
    // --- FIN DE LA MODIFICACIÓN ---

    app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    logger.log('Middleware express.urlencoded configurado globalmente.');

    app.use(compression());
    logger.log('Middleware de compresión (compression) configurado.');
    app.use(morgan('dev'));
    logger.log('Middleware de logging de solicitudes HTTP (morgan) configurado.');

    app.use(
        session({
            secret: process.env.SESSION_SECRET || 'tu-secreto-de-sesion-aqui', // Cambia esto y usa una variable de entorno
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24, // 1 día
            },
        }),
    );
    logger.log('Middleware de sesión (express-session) configurado.');

    app.enableCors({
        origin: [
            'http://localhost:8000',
            'http://127.0.0.1:8000',
            'http://localhost:3000',
            'http://localhost:3001',
            'https://ele-stu.vercel.app'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cookie', 'Origin', 'X-Requested-With', 'stripe-signature'],
        exposedHeaders: ['Set-Cookie'],
    });
    logger.log('CORS configurado.');

    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
    }));
    logger.log('Pipe de validación global (ValidationPipe) configurado.');

    app.setGlobalPrefix('api', {
        exclude: [''],
    });
    logger.log("Prefijo global 'api' configurado para las rutas.");

    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        logger.log(`Directorio de subidas creado en: ${uploadDir}`);
    } else {
        logger.log(`Directorio de subidas ya existe en: ${uploadDir}`);
    }

    app.useStaticAssets(uploadDir, {
        prefix: '/uploads/',
    });
    logger.log("Middleware para servir archivos estáticos desde '/uploads/' configurado.");

    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`🚀 Servidor NestJS corriendo en el puerto: ${port}`);

    const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;
    logger.log(`🌍 API debería estar accesible en: ${baseUrl}/api`);
}

bootstrap()
    .then(() => {
        // El logger dentro de bootstrap ya indica el inicio.
    })
    .catch(error => {
        const criticalLogger = new Logger('BootstrapCriticalError');
        criticalLogger.error(`Error crítico al iniciar la aplicación: ${error.message}`, error.stack);
        process.exit(1);
    });
