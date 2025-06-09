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
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // --- CORRECCIÓN AQUÍ ---
        // 1. Obtenemos la variable de entorno
        const databaseUrl = configService.get<string>('DATABASE_URL');

        // 2. Verificamos si existe. Si no, lanzamos un error claro.
        if (!databaseUrl) {
          throw new Error('La variable de entorno DATABASE_URL no está definida.');
        }

        // 3. Si existe, la usamos en la configuración.
        return {
          type: 'postgres',
          url: databaseUrl,
          ssl: {
            rejectUnauthorized: false,
          },
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // --- CORRECCIÓN SIMILAR AQUÍ ---
        const emailHost = configService.get<string>('EMAIL_HOST');
        const emailUser = configService.get<string>('EMAIL_USER');
        const emailPass = configService.get<string>('EMAIL_PASS');
        const emailPort = parseInt(configService.get<string>('EMAIL_PORT', '587'));
        const emailSecure = configService.get<string>('EMAIL_SECURE') === 'true';

        if (!emailHost || !emailUser || !emailPass) {
          throw new Error('Las variables de entorno del correo (EMAIL_HOST, EMAIL_USER, EMAIL_PASS) no están definidas.');
        }

        return {
          transport: {
            host: emailHost,
            port: emailPort,
            secure: emailSecure,
            auth: {
              user: emailUser,
              pass: emailPass,
            },
          },
          defaults: {
            from: `"EleStu" <${emailUser}>`,
          },
          template: {
            dir: join(__dirname, '..', 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        }
      }
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
