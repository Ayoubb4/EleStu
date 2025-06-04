// src/payments/payments.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { UserModule } from '../users/user.module';
import { ServicesModule } from '../services/services.module'; // <--- AÑADIDO
import { TypeOrmModule } from '@nestjs/typeorm'; // <--- AÑADIDO
import { ServiceBooking } from '../bookings/entities/service-booking.entity'; // <--- AÑADIDO

@Module({
    imports: [
        ConfigModule,
        forwardRef(() => UserModule),
        ServicesModule, // <--- AÑADIDO
        TypeOrmModule.forFeature([ServiceBooking]), // <--- AÑADIDO
    ],
    controllers: [PaymentsController],
    providers: [
        PaymentsService,
        {
            provide: 'STRIPE_CLIENT',
            useFactory: (configService: ConfigService) => {
                const apiKey = configService.get<string>('STRIPE_SECRET_KEY')!;
                return new Stripe(apiKey, {
                    apiVersion: "2025-04-30.basil",
                });
            },
            inject: [ConfigService],
        },
    ],
    exports: [PaymentsService],
})
export class PaymentsModule {}