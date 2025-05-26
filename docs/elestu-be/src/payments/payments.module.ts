import { Module, forwardRef } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { UserModule } from '../users/user.module'; // MODIFICADO: Importar UserModule

@Module({
    imports: [
        ConfigModule,
        forwardRef(() => UserModule), // MODIFICADO: Usar UserModule con forwardRef
    ],
    controllers: [PaymentsController],
    providers: [
        PaymentsService,
        {
            provide: 'STRIPE_CLIENT',
            useFactory: (configService: ConfigService) => {
                const apiKey = configService.get<string>('STRIPE_SECRET_KEY')!;
                return new Stripe(apiKey, {
                    apiVersion: '2025-04-30.basil',
                });
            },
            inject: [ConfigService],
        },
    ],
    exports: [PaymentsService], // Exporta PaymentsService si otros módulos lo necesitan
})
export class PaymentsModule {}
