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
      isGlobal: true, // Esto hace que ConfigModule esté disponible en toda la app
    }),

    // --- MODIFICACIÓN CLAVE PARA RENDER ---
    // Se reemplaza la configuración de TypeOrm por una asíncrona que lee las variables de entorno
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get<string>('NODE_ENV') === 'production';

        // Esta es la configuración para producción (Render)
        if (isProduction) {
          return {
            type: 'postgres',
            // Render proporciona la URL completa en esta variable de entorno
            url: configService.get<string>('DATABASE_URL'),
            // Las bases de datos de Render requieren SSL
            ssl: {
              rejectUnauthorized: false,
            },
            autoLoadEntities: true,
            // IMPORTANTE: En producción, synchronize debe ser false.
            // Los cambios en la BD se deben manejar con migraciones.
            synchronize: false,
          };
        }

        // Esta es la configuración para desarrollo (tu PC)
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: parseInt(configService.get<string>('DB_PORT', '5432')),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: true, // Puedes dejarlo en true para desarrollo local
        };
      },
    }),
    // --- FIN DE LA MODIFICACIÓN ---

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('EMAIL_HOST'),
          port: parseInt(configService.get<string>('EMAIL_PORT', '587')),
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
