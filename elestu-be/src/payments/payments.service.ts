import { Injectable, Inject, forwardRef } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { UserService } from '../users/user.service';

@Injectable()
export class PaymentsService {
    constructor(
        @Inject('STRIPE_CLIENT') private stripe: Stripe,
        private configService: ConfigService,
        @Inject(forwardRef(() => UserService))
        private userService: UserService,
    ) {}

    async createPaymentIntent(amount: number, currency: string, serviceTitle: string, userId?: string) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount,
                currency,
                metadata: {
                    serviceTitle: serviceTitle,
                    userId: userId ?? null, // FIXED: Pass null if userId is undefined
                },
            });
            return { clientSecret: paymentIntent.client_secret };
        } catch (error) {
            console.error('Error creating Payment Intent:', error);
            throw new Error('Failed to create Payment Intent');
        }
    }

    async handleStripeWebhook(payload: Buffer, signature: string, webhookSecret: string) {
        let event: Stripe.Event;

        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        } catch (err) {
            console.error(`Webhook Error: ${err.message}`);
            throw new Error(`Webhook Error: ${err.message}`);
        }

        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntentSucceeded = event.data.object as Stripe.PaymentIntent;
                console.log(`PaymentIntent for ${paymentIntentSucceeded.amount} was successful!`);
                await this.sendConfirmationEmail(paymentIntentSucceeded);
                break;
            case 'payment_method.attached':
                const paymentMethod = event.data.object as Stripe.PaymentMethod;
                console.log('PaymentMethod was attached to a Customer!');
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return { received: true };
    }

    async sendConfirmationEmail(paymentIntent: Stripe.PaymentIntent) {
        const userIdFromMetadata = paymentIntent.metadata?.userId;
        let customerEmail: string | undefined;

        if (userIdFromMetadata) {
            const userIdAsNumber = parseInt(userIdFromMetadata as string, 10); // Ensure it's treated as string for parseInt

            if (!isNaN(userIdAsNumber)) {
                try {
                    const user = await this.userService.findById(userIdAsNumber);
                    if (user && user.email) {
                        customerEmail = user.email;
                    } else {
                        console.warn(`User with ID ${userIdFromMetadata} not found or has no email.`);
                    }
                } catch (error) {
                    console.error(`Error fetching user ${userIdFromMetadata} from DB:`, error);
                }
            } else {
                console.warn(`Invalid userId format in metadata: ${userIdFromMetadata}`);
            }
        }

        customerEmail = customerEmail || paymentIntent.receipt_email || 'test@example.com';

        const serviceTitle = paymentIntent.metadata.serviceTitle || 'Servicio Contratado';
        const amount = (paymentIntent.amount / 100).toFixed(2);
        const currency = paymentIntent.currency.toUpperCase();

        const emailUser = this.configService.get<string>('EMAIL_USER');
        const emailPass = this.configService.get<string>('EMAIL_PASS');

        if (!emailUser || !emailPass) {
            console.error('Error: EMAIL_USER or EMAIL_PASS not configured in .env file. Cannot send email.');
            return;
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass,
            },
        });

        const mailOptions = {
            from: emailUser,
            to: customerEmail,
            subject: '¡Confirmación de tu compra en EleStu!',
            html: `
        <p>¡Hola!</p>
        <p>Tu pago de <b>${amount} ${currency}</b> por <b>"${serviceTitle}"</b> ha sido procesado con éxito.</p>
        <p>Gracias por tu compra. Te enviaremos más detalles pronto.</p>
        <p>¡Saludos!</p>
        <p>El equipo de EleStu</p>
      `,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Correo de confirmación enviado a ${customerEmail}`);
        } catch (error) {
            console.error(`Error al enviar el correo de confirmación a ${customerEmail}:`, error);
            if (error.code === 'EAUTH' || error.code === 'ECONNREFUSED') {
                console.error('Verifica las credenciales de correo o la configuración SMTP en tu archivo .env.');
            }
        }
    }
}
