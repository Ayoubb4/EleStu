import { Injectable, Inject } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
    constructor(@Inject('STRIPE_CLIENT') private stripe: Stripe) {}

    async createPaymentIntent(amount: number, currency: string, serviceTitle: string) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount, // en centavos
                currency,
                metadata: { serviceTitle: serviceTitle }, // Puedes añadir metadatos relevantes
            });
            return { clientSecret: paymentIntent.client_secret };
        } catch (error) {
            console.error('Error creating Payment Intent:', error);
            throw new Error('Failed to create Payment Intent');
        }
    }

    // Este método manejaría los webhooks de Stripe (eventos de pago)
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
                // Aquí es donde enviarías el correo de confirmación
                await this.sendConfirmationEmail(paymentIntentSucceeded);
                break;
            case 'payment_method.attached':
                const paymentMethod = event.data.object as Stripe.PaymentMethod;
                console.log('PaymentMethod was attached to a Customer!');
                // Lógica para manejar un nuevo método de pago adjunto
                break;
            // ... manejar otros tipos de eventos relevantes
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return { received: true };
    }

    // Función simulada para enviar correo de confirmación
    async sendConfirmationEmail(paymentIntent: Stripe.PaymentIntent) {
        const customerEmail = paymentIntent.receipt_email || 'customer@example.com'; // O obtén el email de tu base de datos
        const serviceTitle = paymentIntent.metadata.serviceTitle || 'Servicio Contratado';
        const amount = (paymentIntent.amount / 100).toFixed(2); // Convertir de centavos a euros

        console.log(`
      --- ENVIANDO CORREO DE CONFIRMACIÓN ---
      Para: ${customerEmail}
      Asunto: ¡Confirmación de tu compra en EleStu!
      Contenido:
        ¡Hola!
        Tu pago de ${amount} ${paymentIntent.currency.toUpperCase()} por "${serviceTitle}" ha sido procesado con éxito.
        Gracias por tu compra. Te enviaremos más detalles pronto.
        ¡Saludos!
        El equipo de EleStu
      ---------------------------------------
    `);
        // === INTEGRACIÓN REAL DE ENVÍO DE CORREOS IRÍA AQUÍ ===
        // Usar una librería como 'nodemailer' o un servicio como SendGrid/Mailgun.
        // Ejemplo (pseudocódigo con nodemailer):
        /*
        const nodemailer = require('nodemailer');
        let transporter = nodemailer.createTransport({
            service: 'gmail', // o tu servicio SMTP
            auth: {
                user: 'tu_email@gmail.com',
                pass: 'tu_contraseña_app'
            }
        });

        let mailOptions = {
            from: 'tu_email@gmail.com',
            to: customerEmail,
            subject: 'Confirmación de tu compra en EleStu',
            html: `<p>¡Hola!</p><p>Tu pago de <b>${amount} ${paymentIntent.currency.toUpperCase()}</b> por <b>"${serviceTitle}"</b> ha sido procesado con éxito.</p><p>Gracias por tu compra. Te enviaremos más detalles pronto.</p><p>¡Saludos!</p><p>El equipo de EleStu</p>`
        };

        await transporter.sendMail(mailOptions);
        */
    }
}