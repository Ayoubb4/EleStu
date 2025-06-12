// src/bookings/bookings.service.ts
import {
    Injectable,
    InternalServerErrorException,
    Logger,
    BadRequestException,
    NotFoundException,
    ForbiddenException,
    ConflictException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/user.entity';
import { ServiceBooking } from './entities/service-booking.entity';
import { CreateServiceBookingDto } from './dto/create-service-booking.dto'; // AÑADIDO: DTO para reservas de servicio
import { PdfService } from '../pdf/pdf.service'; // AÑADIDO: Importamos nuestro servicio de PDF
import { Service } from '../services/service.entity'; // AÑADIDO: Importamos la entidad de Servicio

@Injectable()
export class BookingsService {
    private readonly logger = new Logger(BookingsService.name);

    constructor(
        @InjectRepository(Booking)
        private studioBookingsRepository: Repository<Booking>,
        @InjectRepository(ServiceBooking)
        private serviceBookingsRepository: Repository<ServiceBooking>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        // AÑADIDO: Importamos el repositorio de Service para obtener datos del proveedor
        @InjectRepository(Service)
        private servicesRepository: Repository<Service>,
        private readonly mailerService: MailerService,
        // AÑADIDO: Inyectamos el servicio de PDF
        private readonly pdfService: PdfService,
    ) {}

    // --- Lógica para Reservas de ESTUDIOS ---
    async create(createBookingDto: CreateBookingDto): Promise<Booking> {
        try {
            const existingBooking = await this.studioBookingsRepository.findOne({
                where: {
                    studioId: createBookingDto.studioId,
                    date: createBookingDto.date,
                    time: createBookingDto.time,
                }
            });
            if (existingBooking) {
                throw new ConflictException('Esta fecha y hora ya están reservadas para este estudio.');
            }

            const user = await this.usersRepository.findOne({ where: { id: createBookingDto.userId } });
            if (!user) throw new BadRequestException(`User with ID ${createBookingDto.userId} not found.`);

            const newBooking = this.studioBookingsRepository.create({ ...createBookingDto, user });
            await this.studioBookingsRepository.save(newBooking);
            this.logger.log(`Studio Booking created: ${newBooking.id} by user ${user.email}`);

            const invoiceData = {
                invoiceNumber: newBooking.id.substring(0, 8).toUpperCase(),
                issueDate: new Date().toLocaleDateString('es-ES'),
                serviceDate: newBooking.date,
                userName: `${user.name} ${user.lastName || ''}`,
                userEmail: user.email,
                serviceTitle: `Reserva de estudio: ${newBooking.studioName}`,
                price: newBooking.pricePerHour, // Ajustar si el precio es por horas
                logoUrl: 'https://i.imgur.com/sCnu9T5.png'
            };
            const pdfBuffer = await this.pdfService.generateInvoicePdf(invoiceData);
            await this.sendBookingConfirmationEmail(newBooking, pdfBuffer);

            return newBooking;
        } catch (error) {
            this.logger.error(`Error creating studio booking: ${error.message}`, error.stack);
            if (error instanceof BadRequestException || error instanceof ConflictException) throw error;
            throw new InternalServerErrorException('Failed to create studio booking.');
        }
    }

    private async sendBookingConfirmationEmail(booking: Booking, pdfInvoice: Buffer): Promise<void> {
        try {
            await this.mailerService.sendMail({
                to: booking.userEmail,
                subject: `Confirmación de Reserva en ${booking.studioName}`,
                template: 'booking-confirmation',
                context: {
                    studioName: booking.studioName,
                    date: booking.date,
                    time: booking.time,
                    description: booking.description,
                    pricePerHour: booking.pricePerHour,
                    currentYear: new Date().getFullYear(),
                },
                attachments: [{
                    filename: `factura-estudio-${booking.id.substring(0,8)}.pdf`,
                    content: pdfInvoice,
                    contentType: 'application/pdf',
                }],
            });
            this.logger.log(`Studio booking confirmation email sent to ${booking.userEmail}`);
        } catch (error) {
            this.logger.error(`Error sending email for studio booking ${booking.id}: ${error.message}`, error.stack);
        }
    }

    // --- AÑADIDO: Toda la lógica para Reservas de SERVICIOS ---
    async createServiceBooking(createDto: CreateServiceBookingDto): Promise<ServiceBooking> {
        try {
            const user = await this.usersRepository.findOne({ where: { id: createDto.userId } });
            if (!user) throw new BadRequestException(`User with ID ${createDto.userId} not found.`);

            const service = await this.servicesRepository.findOne({ where: { id: createDto.serviceId }, relations: ['user']});
            if (!service) throw new BadRequestException(`Service with ID ${createDto.serviceId} not found.`);

            const newBooking = this.serviceBookingsRepository.create({ ...createDto, user, service });
            await this.serviceBookingsRepository.save(newBooking);
            this.logger.log(`Service Booking created: ${newBooking.id} by user ${user.email}`);

            const invoiceData = {
                invoiceNumber: newBooking.id.substring(0, 8).toUpperCase(),
                issueDate: new Date().toLocaleDateString('es-ES'),
                serviceDate: newBooking.date,
                userName: `${user.name} ${user.lastName || ''}`,
                userEmail: user.email,
                serviceTitle: `Contratación de servicio: ${service.title}`,
                price: newBooking.price,
                logoUrl: 'https://i.imgur.com/sCnu9T5.png'
            };

            const pdfBuffer = await this.pdfService.generateInvoicePdf(invoiceData);
            await this.sendServiceBookingConfirmationEmail(newBooking, service, pdfBuffer);

            return newBooking;

        } catch (error) {
            this.logger.error(`Error creating service booking: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to create service booking.');
        }
    }

    private async sendServiceBookingConfirmationEmail(booking: ServiceBooking, service: Service, pdfInvoice: Buffer): Promise<void> {
        try {
            await this.mailerService.sendMail({
                to: booking.userEmail,
                subject: `Confirmación de Reserva del Servicio ${booking.serviceTitle}`,
                template: 'service-booking-confirmation',
                context: {
                    serviceTitle: booking.serviceTitle,
                    date: booking.date,
                    time: booking.time,
                    description: booking.description,
                    price: booking.price,
                    ownerName: `${service.user.name} ${service.user.lastName || ''}`,
                    ownerEmail: service.user.email,
                    ownerPhoneNumber: service.user.phoneNumber || 'No especificado',
                    currentYear: new Date().getFullYear(),
                },
                attachments: [{
                    filename: `factura-servicio-${booking.id.substring(0,8)}.pdf`,
                    content: pdfInvoice,
                    contentType: 'application/pdf',
                }],
            });
            this.logger.log(`Service booking confirmation email sent to ${booking.userEmail}`);
        } catch (error) {
            this.logger.error(`Error sending email for service booking ${booking.id}: ${error.message}`, error.stack);
        }
    }


    async findUserBookings(userId: number): Promise<{ studioBookings: Booking[], serviceBookings: ServiceBooking[] }> {
        try {
            const studioBookings = await this.studioBookingsRepository.find({
                where: { user: { id: userId } },
                order: { date: 'DESC', time: 'ASC' },
            });

            const serviceBookings = await this.serviceBookingsRepository.find({
                where: { user: { id: userId } },
                order: { date: 'DESC', time: 'ASC' },
            });

            return { studioBookings, serviceBookings };

        } catch (error) {
            this.logger.error(`Error fetching bookings for user ${userId}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to fetch user bookings.');
        }
    }

    async cancelBooking(id: string, type: 'studio' | 'service', userId: number): Promise<{ message: string }> {
        let repository: Repository<any>;

        if (type === 'studio') {
            repository = this.studioBookingsRepository;
        } else if (type === 'service') {
            repository = this.serviceBookingsRepository;
        } else {
            throw new BadRequestException('Tipo de reserva inválido. Debe ser "studio" o "service".');
        }

        const bookingExists = await repository.findOne({
            where: { id: id, user: { id: userId } },
        });

        if (!bookingExists) {
            throw new NotFoundException(`Reserva de ${type} con ID ${id} no encontrada o no pertenece a este usuario.`);
        }

        await repository.delete(id);
        this.logger.log(`Booking ${id} of type ${type} deleted by user ${userId}.`);

        return { message: 'Reserva eliminada correctamente.' };
    }
}