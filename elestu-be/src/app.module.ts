// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { StudioModule } from './studios/studio.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/user.entity';
import { Service } from "./services/service.entity";
import { ServicesModule } from './services/services.module';
import { PaymentsModule } from './payments/payments.module';
import { BookingsModule } from './bookings/bookings.module';
import { Booking } from './bookings/entities/booking.entity';

// --- ADDED FOR MAILER ---
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
// --- END ADDED FOR MAILER ---

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'EleStuAdmin',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME || 'EleStu',
      entities: [User, Service, Booking],
      synchronize: false,
      logging: true,
    }),
    // --- MODIFIED MAILER MODULE CONFIGURATION ---
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST as string,
        port: parseInt(process.env.EMAIL_PORT as string, 10) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER as string,
          pass: process.env.EMAIL_PASS as string,
        },
      },
      defaults: {
        from: '"EleStu" <elestu777@gmail.com>',
      },
      template: {
        // CAMBIO AQUÍ: Simplificamos la ruta para que apunte directamente a 'templates' dentro de 'dist'
        dir: join(__dirname, '..', 'templates'), // <--- RUTA MODIFICADA
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    // --- END MODIFIED MAILER MODULE CONFIGURATION ---
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