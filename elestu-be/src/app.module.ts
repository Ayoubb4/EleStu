// src/app.module.ts (MODIFIED)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // Keep ConfigModule if you're using it for other things globally
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { StudioModule } from './studios/studio.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/user.entity'; // Make sure User entity is correctly imported
import { Service } from "./services/service.entity";
import { ServicesModule } from './services/services.module';
import { PaymentsModule } from './payments/payments.module';
import { BookingsModule } from './bookings/bookings.module'; // IMPORT YOUR NEW BOOKINGS MODULE
import { Booking } from './bookings/entities/booking.entity'; // IMPORT YOUR NEW BOOKING ENTITY

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
    AuthModule,
    UserModule,
    StudioModule,
    ServicesModule,
    PaymentsModule,
    BookingsModule // ADD YOUR BOOKINGS MODULE HERE
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}