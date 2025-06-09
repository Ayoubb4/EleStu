// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { StudioModule } from './studios/studio.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServicesModule } from './services/services.module';
import { PaymentsModule } from './payments/payments.module';
import { BookingsModule } from './bookings/bookings.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Asegura que lea el archivo .env en desarrollo
    }),

    // --- Configuración Definitiva de TypeORM para Render ---
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',

        // Usamos la DATABASE_URL directamente. Render la proporciona en producción.
        // Tu .env local también debería tener esta variable para desarrollo.
        url: configService.get<string>('DATABASE_URL'),

        // La opción ssl es CRUCIAL para conectar con Render y otros proveedores en la nube.
        ssl: {
          rejectUnauthorized: false,
        },

        autoLoadEntities: true,

        // En producción, NUNCA usar synchronize: true. Las migraciones se encargan.
        synchronize: false,
      }),
    }),
    // --- FIN ---

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('EMAIL_HOST'),
          port: parseInt(configService.get<string>('EMAIL_PORT'), '587'),
          secure: configService.get<string>('EMAIL_SECURE') === 'true',
          auth: {
            user: configService.get<string>('EMAIL_USER'),
            pass: configService.get<string>('EMAIL_PASS'),
          },
        },
        defaults: {
          from: `"EleStu" <${configService.get<string>('EMAIL_USER')}>`,
        },
        template: {
          dir: join(__dirname, '..', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      })
    }),
    AuthModule,
    UserModule,
    StudioModule,
    ServicesModule,
    PaymentsModule,
    BookingsModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}