// src/payments/payments.controller.ts
import { Controller, Post, Body, Res, Req, RawBodyRequest, HttpStatus, HttpException, Logger } from '@nestjs/common'; // Logger ya estaba importado
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
    private readonly logger = new Logger(PaymentsController.name); // Logger para este controlador

    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly configService: ConfigService,
    ) {}

    @Post('create-payment-intent')
    async createPaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
        try {
            const {
                amount,
                currency,
                serviceTitle,
                serviceId,
                bookingDate,
                bookingTime,
                bookingDescription,
                userId
            } = createPaymentIntentDto;

            const paymentIntent = await this.paymentsService.createPaymentIntent(
                amount,
                currency,
                serviceTitle,
                serviceId,
                bookingDate,
                bookingTime,
                bookingDescription,
                userId
            );
            return paymentIntent;
        } catch (error) {
            throw new HttpException(error.message || 'Failed to create Payment Intent', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('webhook')
    async handleWebhook(@Req() req: RawBodyRequest<Request>, @Res() res: Response) {
        // --- INICIO DE LOGS DE DEPURACIÓN ---
        this.logger.log('--- INICIO: Inspección de Solicitud Webhook ---');
        this.logger.log(`Método de la solicitud: ${req.method}`);
        this.logger.log(`URL original: ${req.originalUrl}`);
        this.logger.log(`Cabeceras: ${JSON.stringify(req.headers, null, 2)}`); // Imprime todas las cabeceras

        this.logger.log(`Keys del objeto req: ${Object.keys(req)}`);
        this.logger.log(`Tipo de req.rawBody: ${typeof req.rawBody}`);
        if (req.rawBody instanceof Buffer) {
            this.logger.log(`Longitud de req.rawBody (Buffer): ${req.rawBody.length}`);
            // this.logger.log(`req.rawBody (primeros bytes como string): ${req.rawBody.slice(0, 50).toString()}`); // Imprime una parte como string
        } else {
            this.logger.log(`Valor de req.rawBody: ${JSON.stringify(req.rawBody)}`);
        }

        this.logger.log(`Tipo de req.body: ${typeof req.body}`);
        // No imprimas req.body si es un objeto grande sin cuidado, podría llenar los logs
        // this.logger.log(`Valor de req.body: ${JSON.stringify(req.body)}`);

        const sigHeader = req.headers['stripe-signature'];
        this.logger.log(`Cabecera 'stripe-signature' (sigHeader): ${JSON.stringify(sigHeader)}`);
        this.logger.log(`Tipo de sigHeader: ${typeof sigHeader}`);

        const webhookSecretFromConfig = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
        this.logger.log(`STRIPE_WEBHOOK_SECRET de ConfigService: ${webhookSecretFromConfig ? 'CARGADO (longitud: ' + webhookSecretFromConfig.length + ')' : 'NO CARGADO o vacío'}`);
        this.logger.log('--- FIN: Inspección de Solicitud Webhook ---');
        // --- FIN DE LOGS DE DEPURACIÓN ---

        const sig = sigHeader;
        const rawBody = req.rawBody;
        const webhookSecret = webhookSecretFromConfig;

        if (!rawBody || !sig || !webhookSecret) {
            this.logger.error('Webhook Error: Missing rawBody, signature, or webhook secret. Detallando:');
            this.logger.error(`rawBody presente: ${!!rawBody} (tipo: ${typeof rawBody})`);
            this.logger.error(`sig presente: ${!!sig} (tipo: ${typeof sig}, valor: ${JSON.stringify(sig)})`);
            this.logger.error(`webhookSecret presente: ${!!webhookSecret} (valor: ${webhookSecret ? 'CARGADO' : 'NO CARGADO'})`);
            return res.status(HttpStatus.BAD_REQUEST).send('Webhook Secret, Signature, or Raw Body missing');
        }

        const signature = Array.isArray(sig) ? sig[0] : sig;
        if (typeof signature !== 'string') {
            this.logger.error(`Webhook Error: Stripe signature no es un string válido. Recibido: ${JSON.stringify(sig)}`);
            return res.status(HttpStatus.BAD_REQUEST).send('Stripe signature format invalid');
        }

        try {
            await this.paymentsService.handleStripeWebhook(rawBody, signature, webhookSecret);
            return res.status(HttpStatus.OK).send({ received: true });
        } catch (error) {
            this.logger.error(`Error en paymentsService.handleStripeWebhook: ${error.message}`, error.stack);
            return res.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${error.message}`);
        }
    }
}
