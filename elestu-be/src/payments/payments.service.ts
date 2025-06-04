// src/payments/payments.service.ts
import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common'; // InternalServerErrorException no se usa directamente aquí
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../users/user.service';
import { ServicesService } from '../services/services.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceBooking } from '../bookings/entities/service-booking.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/user.entity';
import { Service } from '../services/service.entity';
import { join } from 'path';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);

    constructor(
        @Inject('STRIPE_CLIENT') private stripe: Stripe,
        private configService: ConfigService,
        @Inject(forwardRef(() => UserService))
        private userService: UserService,
        private readonly servicesService: ServicesService,
        @InjectRepository(ServiceBooking)
        private serviceBookingRepository: Repository<ServiceBooking>,
        private readonly mailerService: MailerService,
    ) {}

    async createPaymentIntent(
        amount: number,
        currency: string,
        serviceTitle: string,
        serviceId: number,
        bookingDate: string,
        bookingTime: string,
        bookingDescription: string,
        userId?: string, // Este userId viene del frontend
    ) {
        this.logger.log('--------------------------------------------------');
        this.logger.log('✨ Intentando Crear PaymentIntent ✨');
        this.logger.log('--------------------------------------------------');
        this.logger.log(`➡️  Datos Recibidos del Frontend:`);
        this.logger.log(`   🔹 Monto: ${amount} ${currency.toUpperCase()}`);
        this.logger.log(`   🔹 Título del Servicio: "${serviceTitle}" (ID: ${serviceId})`);
        this.logger.log(`   🔹 Fecha Reserva: ${bookingDate}`);
        this.logger.log(`   🔹 Hora Reserva: ${bookingTime}`);
        this.logger.log(`   🔹 Descripción Reserva: "${bookingDescription}"`);
        this.logger.log(`   👤 UserID (del frontend): ${userId || 'No proporcionado (posiblemente guest)'}`);
        this.logger.log('--------------------------------------------------');

        try {
            const userIdForMetadata = userId && userId.trim() !== '' ? userId : 'guest';
            this.logger.log(`   ℹ️  UserID que se guardará en metadata de Stripe: "${userIdForMetadata}"`);

            const paymentIntent = await this.stripe.paymentIntents.create({
                amount,
                currency,
                metadata: {
                    serviceTitle: serviceTitle,
                    serviceId: String(serviceId),
                    bookingDate: bookingDate,
                    bookingTime: bookingTime,
                    bookingDescription: bookingDescription,
                    userId: userIdForMetadata,
                },
            });

            // --- CORREGIDO AQUÍ ---
            // Verificar si client_secret existe y es un string antes de usar substring
            const clientSecretForLog = paymentIntent.client_secret
                ? `${paymentIntent.client_secret.substring(0, 15)}...`
                : 'NO DISPONIBLE';
            this.logger.log(`✅ PaymentIntent Creado Exitosamente. Client Secret: ${clientSecretForLog}`);
            // --- FIN DE LA CORRECCIÓN ---

            return { clientSecret: paymentIntent.client_secret }; // Devolver el client_secret completo
        } catch (error) {
            this.logger.error('❌ Error al crear Payment Intent:', error.message, error.stack);
            throw new Error(`Error al crear Payment Intent: ${error.message}`);
        }
    }

    async handleStripeWebhook(payload: Buffer, signature: string, webhookSecret: string) {
        let event: Stripe.Event;
        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        } catch (err) {
            this.logger.error(`❌ Webhook Error - Fallo al construir evento: ${err.message}`, err.stack);
            throw new Error(`Webhook Error: ${err.message}`);
        }

        this.logger.log(`📬 Evento Stripe Recibido: ${event.type} (ID: ${event.id})`);

        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntentSucceeded = event.data.object as Stripe.PaymentIntent;
                this.logger.log(`💳 PaymentIntent Exitoso (ID: ${paymentIntentSucceeded.id}) - Monto: ${paymentIntentSucceeded.amount / 100} ${paymentIntentSucceeded.currency.toUpperCase()}`);
                await this.handleSuccessfulPayment(paymentIntentSucceeded);
                break;
            case 'payment_method.attached':
                this.logger.log('📎 PaymentMethod adjuntado a un Cliente.');
                break;
            default:
                this.logger.log(`🤷 Evento Stripe no manejado: ${event.type}`);
        }
        return { received: true };
    }

    private async handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
        this.logger.log('--------------------------------------------------');
        this.logger.log('⚙️ Procesando Pago Exitoso (handleSuccessfulPayment) ⚙️');
        this.logger.log(`   Stripe PaymentIntent ID: ${paymentIntent.id}`);
        this.logger.log('--------------------------------------------------');
        this.logger.log('   Metadata de Stripe recibida:');
        this.logger.log(`     ├─ serviceId: "${paymentIntent.metadata.serviceId}"`);
        this.logger.log(`     ├─ userId (contratante desde metadata): "${paymentIntent.metadata.userId}"`);
        this.logger.log(`     ├─ serviceTitle: "${paymentIntent.metadata.serviceTitle}"`);
        this.logger.log(`     ├─ bookingDate: "${paymentIntent.metadata.bookingDate}"`);
        this.logger.log(`     ├─ bookingTime: "${paymentIntent.metadata.bookingTime}"`);
        this.logger.log(`     └─ bookingDescription: "${paymentIntent.metadata.bookingDescription}"`);
        this.logger.log('--------------------------------------------------');

        const {
            serviceId: serviceIdString,
            userId: contractingUserIdStringFromMetadata,
            bookingDate,
            bookingTime,
            bookingDescription
        } = paymentIntent.metadata;

        const amountFromStripe = paymentIntent.amount / 100;

        if (!serviceIdString) {
            this.logger.error('❌ Error Crítico: PaymentIntent exitoso pero serviceId falta en los metadatos.', paymentIntent.id);
            return;
        }

        try {
            const serviceIdNum = parseInt(serviceIdString, 10);
            const serviceEntity = await this.servicesService.findOne(serviceIdNum);

            if (!serviceEntity || !serviceEntity.user) {
                this.logger.error(`❌ Error: Servicio con ID ${serviceIdNum} o su dueño (service.user) no encontrado.`);
                return;
            }
            const serviceOwner = serviceEntity.user;
            this.logger.log(`👨‍💼 Dueño del Servicio (ID: ${serviceOwner.id}): ${serviceOwner.name} <${serviceOwner.email}>`);

            let contractingUser: User | null = null;
            let contractingUserEmailForBooking: string | undefined;
            let contractingUserNameForBooking: string = 'Cliente Valioso';

            if (contractingUserIdStringFromMetadata && contractingUserIdStringFromMetadata !== 'guest') {
                this.logger.log(`🔎 Buscando usuario contratante con ID de metadata: "${contractingUserIdStringFromMetadata}"`);
                try {
                    const contractingUserIdNum = parseInt(contractingUserIdStringFromMetadata, 10);
                    if (!isNaN(contractingUserIdNum)) {
                        contractingUser = await this.userService.findById(contractingUserIdNum);
                        if (contractingUser) {
                            this.logger.log(`👤 Usuario Contratante Encontrado en BD (ID: ${contractingUser.id}): ${contractingUser.name} <${contractingUser.email}>`);
                            contractingUserEmailForBooking = contractingUser.email;
                            contractingUserNameForBooking = contractingUser.name;
                        } else {
                            this.logger.warn(`⚠️ Usuario contratante con ID ${contractingUserIdNum} NO encontrado en la BD. Se intentará usar receipt_email de Stripe.`);
                        }
                    } else {
                        this.logger.warn(`⚠️ UserID de metadata ("${contractingUserIdStringFromMetadata}") no es un número válido. Se intentará usar receipt_email de Stripe.`);
                    }
                } catch (e) {
                    this.logger.error(`💥 Error al buscar usuario contratante con ID ${contractingUserIdStringFromMetadata}:`, e.stack);
                    this.logger.warn('Se intentará usar receipt_email de Stripe debido al error anterior.');
                }
            } else {
                this.logger.log(`ℹ️ Reserva identificada como de invitado (userId en metadata es "${contractingUserIdStringFromMetadata}"). Se intentará usar receipt_email de Stripe.`);
            }

            if (!contractingUserEmailForBooking) {
                this.logger.log('🤔 Email del contratante aún no determinado, intentando con receipt_email de Stripe...');
                contractingUserEmailForBooking = paymentIntent.receipt_email || undefined;
                if (contractingUserEmailForBooking) {
                    this.logger.log(`📧 Usando receipt_email de Stripe para el contratante: ${contractingUserEmailForBooking}`);
                } else {
                    this.logger.log('🤔 receipt_email de Stripe no disponible. Intentando con el objeto Customer de Stripe...');
                    if (typeof paymentIntent.customer === 'string') {
                        try {
                            const customerObject = await this.stripe.customers.retrieve(paymentIntent.customer);
                            if (!customerObject.deleted) {
                                const customer = customerObject as Stripe.Customer;
                                contractingUserEmailForBooking = customer.email ?? undefined;
                                if (contractingUserEmailForBooking) this.logger.log(`📧 Usando email del objeto Customer de Stripe (obtenido por ID): ${contractingUserEmailForBooking}`);
                            }
                        } catch (e) {this.logger.warn(`⚠️ No se pudo obtener cliente ${paymentIntent.customer} de Stripe`, e.stack);}
                    } else if (paymentIntent.customer && typeof paymentIntent.customer === 'object' && 'email' in paymentIntent.customer) {
                        const customer = paymentIntent.customer as Stripe.Customer;
                        if (!customer.deleted && customer.email) {
                            contractingUserEmailForBooking = customer.email ?? undefined;
                            if (contractingUserEmailForBooking) this.logger.log(`📧 Usando email del objeto Customer (expandido) de Stripe: ${contractingUserEmailForBooking}`);
                        }
                    }
                }
            }

            if (!contractingUserEmailForBooking) {
                this.logger.error(`❌ Error Crítico Final: No se pudo determinar el email del contratante para PaymentIntent ${paymentIntent.id}. No se puede crear la reserva ni enviar correos.`);
                return;
            }
            this.logger.log(`✅ Email final del contratante determinado para la reserva y correos: ${contractingUserEmailForBooking}`);

            this.logger.log('💾 Creando registro de ServiceBooking...');
            const bookingDataToSave: Partial<ServiceBooking> = {
                service: serviceEntity,
                serviceId: serviceEntity.id,
                user: contractingUser || undefined,
                userId: contractingUser ? contractingUser.id : undefined,
                userEmail: contractingUserEmailForBooking,
                serviceTitle: serviceEntity.title,
                date: bookingDate,
                time: bookingTime || null,
                description: bookingDescription || null,
                price: amountFromStripe,
                status: 'confirmed',
            };
            Object.keys(bookingDataToSave).forEach(key => bookingDataToSave[key] === undefined && delete bookingDataToSave[key]);

            const newServiceBooking = this.serviceBookingRepository.create(bookingDataToSave as ServiceBooking);
            await this.serviceBookingRepository.save(newServiceBooking);
            this.logger.log(`✅ Reserva de servicio (ID: ${newServiceBooking.id}) guardada en la BD con userEmail: "${newServiceBooking.userEmail}" y userId: ${newServiceBooking.userId || 'ninguno'}`);

            const currentYear = new Date().getFullYear();
            const formattedPrice = amountFromStripe.toFixed(2);
            const currency = paymentIntent.currency.toUpperCase();
            const logoPath = join(__dirname, '..', '..', 'templates', 'assets', 'EleStuLogo.png');

            this.logger.log(`📬 Intentando enviar correo de confirmación al cliente: ${contractingUserEmailForBooking}`);
            try {
                await this.mailerService.sendMail({
                    to: contractingUserEmailForBooking,
                    subject: `🎉 ¡Tu reserva para "${serviceEntity.title}" está confirmada!`,
                    template: 'service-booking-confirmation',
                    context: {
                        serviceTitle: serviceEntity.title,
                        date: bookingDate,
                        time: bookingTime || 'No especificada',
                        description: bookingDescription || 'Detalles según lo acordado',
                        price: formattedPrice,
                        currency: currency,
                        ownerName: serviceOwner.name,
                        ownerEmail: serviceOwner.email,
                        ownerPhoneNumber: (serviceOwner as any).phoneNumber || 'No disponible',
                        currentYear,
                    },
                    // attachments: [{ filename: 'EleStuLogo.png', path: logoPath, cid: 'EleStuLogo' }]
                });
                this.logger.log(`✅ Correo de confirmación ENVIADO al cliente: ${contractingUserEmailForBooking}`);
            } catch (emailError) {
                this.logger.error(`❌ Error al enviar correo de confirmación al cliente ${contractingUserEmailForBooking}:`, emailError.message, emailError.stack);
            }

            if (serviceOwner.email) {
                this.logger.log(`📬 Intentando enviar notificación al dueño del servicio: ${serviceOwner.email}`);
                try {
                    await this.mailerService.sendMail({
                        to: serviceOwner.email,
                        subject: `🔔 ¡Nueva reserva para tu servicio: "${serviceEntity.title}"!`,
                        template: 'service-booked-notification-owner',
                        context: {
                            ownerName: serviceOwner.name,
                            serviceTitle: serviceEntity.title,
                            contractingUserName: contractingUserNameForBooking,
                            contractingUserEmail: contractingUserEmailForBooking,
                            bookingDate: bookingDate,
                            bookingTime: bookingTime || 'No especificada',
                            bookingDescription: bookingDescription || 'El cliente no añadió descripción adicional',
                            price: formattedPrice,
                            currency: currency,
                            currentYear,
                        },
                        // attachments: [{ filename: 'EleStuLogo.png', path: logoPath, cid: 'EleStuLogo' }]
                    });
                    this.logger.log(`✅ Notificación ENVIADA al dueño del servicio: ${serviceOwner.email}`);
                } catch (emailError) {
                    this.logger.error(`❌ Error al enviar notificación al dueño ${serviceOwner.email}:`, emailError.message, emailError.stack);
                }
            } else {
                this.logger.warn(`⚠️ El dueño del servicio (ID: ${serviceEntity.id}) no tiene un email registrado. No se envió notificación.`);
            }
            this.logger.log('🎉 Proceso de pago exitoso y notificaciones completado.');

        } catch (error) {
            this.logger.error('💥 Error CRÍTICO en la parte principal de handleSuccessfulPayment:', error.message, error.stack);
        }
    }
}
