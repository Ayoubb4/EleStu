import { Controller, Post, Body, Res, Req, RawBodyRequest, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto'; // Crearemos este DTO
import { ConfigService } from '@nestjs/config'; // Para obtener la clave secreta del webhook
import { Request, Response } from 'express'; // Importar Request y Response de express

@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly configService: ConfigService, // Inyectar ConfigService
    ) {}

    @Post('create-payment-intent')
    async createPaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
        try {
            const { amount, currency, serviceTitle } = createPaymentIntentDto;
            const paymentIntent = await this.paymentsService.createPaymentIntent(amount, currency, serviceTitle);
            return paymentIntent;
        } catch (error) {
            return { error: error.message };
        }
    }

    // Endpoint para Stripe Webhooks
    @Post('webhook')
    async handleWebhook(@Req() req: RawBodyRequest<Request>, @Res() res: Response) {
        const sig = req.headers['stripe-signature'];
        const rawBody = req.rawBody; // NestJS RawBodyRequest para obtener el cuerpo crudo
        const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET'); // Obtener el secreto del webhook

        if (!sig || !webhookSecret) {
            return res.status(HttpStatus.BAD_REQUEST).send('Webhook Secret or Signature missing');
        }

        try {
            await this.paymentsService.handleStripeWebhook(rawBody, sig, webhookSecret);
            return res.status(HttpStatus.OK).send({ received: true });
        } catch (error) {
            console.error('Error handling webhook:', error.message);
            return res.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${error.message}`);
        }
    }
}