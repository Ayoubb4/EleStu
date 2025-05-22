import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Importar ConfigModule y ConfigService
import Stripe from 'stripe'; // Importar Stripe

@Module({
    imports: [ConfigModule], // Importar ConfigModule para acceder a variables de entorno
    controllers: [PaymentsController],
    providers: [
        PaymentsService,
        {
            provide: 'STRIPE_CLIENT', // Token para inyectar el cliente de Stripe
            useFactory: (configService: ConfigService) => {
                return new Stripe(configService.get<string>('STRIPE_SECRET_KEY'), {
                    apiVersion: '2024-04-10', // Usa la versión más reciente de la API de Stripe
                });
            },
            inject: [ConfigService], // Inyectar ConfigService para obtener la clave secreta
        },
    ],
})
export class PaymentsModule {}