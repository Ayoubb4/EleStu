// src/bookings/bookings.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity';
import { ServiceBooking } from './entities/service-booking.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
// --- AÑADIDO: Importamos la entidad Service y el módulo Pdf ---
import { Service } from '../services/service.entity';
import { PdfModule } from '../pdf/pdf.module';

@Module({
    imports: [
        // --- MODIFICADO: Añadimos la entidad 'Service' para que el repositorio esté disponible ---
        TypeOrmModule.forFeature([Booking, User, ServiceBooking, Service]),

        // --- AÑADIDO: Importamos el PdfModule para poder inyectar PdfService ---
        PdfModule,

        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                transport: {
                    service: configService.get<string>('EMAIL_SERVICE'),
                    auth: {
                        user: configService.get<string>('EMAIL_USER'),
                        pass: configService.get<string>('EMAIL_PASS'),
                    },
                },
                defaults: {
                    from: `"EleStu" <${configService.get<string>('EMAIL_USER')}>`,
                },
                template: {
                    dir: process.cwd() + '/src/templates',
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
            inject: [ConfigService],
        }),
        ConfigModule,
    ],
    controllers: [BookingsController],
    providers: [BookingsService],
    exports: [BookingsService],
})
export class BookingsModule {}