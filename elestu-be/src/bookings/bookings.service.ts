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
import { join } from 'path';
import { ServiceBooking } from './entities/service-booking.entity';

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
        private readonly mailerService: MailerService,
    ) {}

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
                throw new ConflictException('Esta fecha y hora ya están reservadas. Por favor, elige otra.');
            }

            const user = await this.usersRepository.findOne({ where: { id: createBookingDto.userId } });
            if (!user) {
                throw new BadRequestException(`User with ID ${createBookingDto.userId} not found.`);
            }

            const newBooking = this.studioBookingsRepository.create({
                ...createBookingDto,
                user: user,
            });

            await this.studioBookingsRepository.save(newBooking);
            this.logger.log(`Booking created for studio: ${newBooking.studioName} by user ${newBooking.userId} (${newBooking.userEmail})`);

            // --- AÑADIDO: Ahora también pasamos el DTO original a la función del email ---
            // Esto nos da acceso a la dirección y ubicación que no se guardan en la entidad Booking.
            await this.sendBookingConfirmationEmail(newBooking, createBookingDto);

            return newBooking;
        } catch (error) {
            this.logger.error(`Error creating booking: ${error.message}`, error.stack);
            if (error instanceof BadRequestException || error instanceof ConflictException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to create booking or send confirmation email.');
        }
    }

    // --- AÑADIDO: La función ahora acepta el DTO para tener más contexto ---
    private async sendBookingConfirmationEmail(booking: Booking, dto: CreateBookingDto): Promise<void> {
        try {
            const logoPath = join(process.cwd(), 'dist', 'images', 'EleStu.png');

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
                    // --- AÑADIDO: Pasamos la dirección y la ubicación a la plantilla del email ---
                    address: dto.address,
                    location: dto.location,
                },
                attachments: [
                    {
                        filename: 'EleStuLogo.png',
                        path: logoPath,
                        cid: 'EleStuLogo',
                    },
                ],
            });
            this.logger.log(`Booking confirmation email sent to ${booking.userEmail}`);
        } catch (error) {
            this.logger.error(`Error sending email for booking ${booking.id}: ${error.message}`, error.stack);
            // --- AÑADIDO: Relanzamos el error para que el log principal lo capture si falla el email ---
            throw new InternalServerErrorException(`Failed to send confirmation email. Error: ${error.message}`);
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

    async cancelBooking(
        id: string,
        type: 'studio' | 'service',
        userId: number
    ): Promise<{ message: string }> {
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