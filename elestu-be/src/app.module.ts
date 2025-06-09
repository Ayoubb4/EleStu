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
        const databaseUrl = configService.get<string>('DATABASE_URL');
        if (!databaseUrl) {
          throw new Error('FATAL ERROR: La variable de entorno DATABASE_URL no está definida.');
        }
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
        const emailUser = configService.get<string>('EMAIL_USER');
        const emailPass = configService.get<string>('EMAIL_PASS');
        if (!emailUser || !emailPass) {
          throw new Error('FATAL ERROR: Las variables de entorno para el email (EMAIL_USER, EMAIL_PASS) no están definidas.');
        }

        return {
          transport: {
            host: configService.get<string>('EMAIL_HOST', 'smtp.gmail.com'),
            port: parseInt(configService.get<string>('EMAIL_PORT', '587'), 10),
            secure: configService.get<string>('EMAIL_SECURE') === 'true',
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
