import { Controller, Post, Body, Res, Req, RawBodyRequest, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly configService: ConfigService,
    ) {}

    @Post('create-payment-intent')
    async createPaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
        try {
            const { amount, currency, serviceTitle, userId } = createPaymentIntentDto;
            const paymentIntent = await this.paymentsService.createPaymentIntent(amount, currency, serviceTitle, userId);
            return paymentIntent;
        } catch (error) {
            return { error: error.message };
        }
    }

    // Endpoint para Stripe Webhooks
    @Post('webhook')
    async handleWebhook(@Req() req: RawBodyRequest<Request>, @Res() res: Response) {
        const sig = req.headers['stripe-signature'];
        const rawBody = req.rawBody; // Esto debería estar disponible ahora

        const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

        // ¡CRUCIAL! Asegúrate de que rawBody y sig no sean undefined
        if (!rawBody || !sig || !webhookSecret) {
            console.error('Webhook Error: Missing rawBody, signature, or webhook secret.');
            return res.status(HttpStatus.BAD_REQUEST).send('Webhook Secret, Signature, or Raw Body missing');
        }

        // Asegúrate de que sig sea un string (puede venir como string o string[])
        const signature = Array.isArray(sig) ? sig[0] : sig;

        try {
            await this.paymentsService.handleStripeWebhook(rawBody, signature, webhookSecret);
            return res.status(HttpStatus.OK).send({ received: true });
        } catch (error) {
            console.error('Error handling webhook:', error.message);
            return res.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${error.message}`);
        }
    }
}
