// src/bookings/bookings.service.ts
import { Injectable, InternalServerErrorException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity'; // This seems to be your Studio Booking entity
import { CreateBookingDto } from './dto/create-booking.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/user.entity';
import { join } from 'path';

// Assuming you have a separate entity for Service Bookings.
// Adjust the path and entity name if yours is different.
import { ServiceBooking } from './entities/service-booking.entity'; // <-- ADDED: Path to your ServiceBooking entity

@Injectable()
export class BookingsService {
    private readonly logger = new Logger(BookingsService.name);

    constructor(
        @InjectRepository(Booking)
        private studioBookingsRepository: Repository<Booking>, // Renamed for clarity: this is for studio bookings
        @InjectRepository(ServiceBooking) // <-- ADDED: Inject repository for ServiceBooking
        private serviceBookingsRepository: Repository<ServiceBooking>, // <-- ADDED: Repository for service bookings
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private readonly mailerService: MailerService,
    ) {}

    async create(createBookingDto: CreateBookingDto): Promise<Booking> {
        // Your existing create method might need to be split or modified
        // if it needs to handle both studio and service bookings based on DTO content.
        // For now, it seems designed for studio bookings based on studioName, pricePerHour.
        try {
            // 1. Validate if the userId exists in the "Usuarios" table
            const user = await this.usersRepository.findOne({ where: { id: createBookingDto.userId } });
            if (!user) {
                throw new BadRequestException(`User with ID ${createBookingDto.userId} not found.`);
            }

            // 2. Create a new booking instance from DTO
            const newBooking = this.studioBookingsRepository.create({ // Use studioBookingsRepository
                ...createBookingDto,
                user: user, // Link the user entity to the booking relationship
            });

            // 3. Save the booking to the database
            await this.studioBookingsRepository.save(newBooking); // Use studioBookingsRepository
            this.logger.log(`Booking created for studio: ${newBooking.studioName} by user ${newBooking.userId} (${newBooking.userEmail})`);

            // 4. Send confirmation email to the user
            await this.sendBookingConfirmationEmail(newBooking);

            return newBooking;
        } catch (error) {
            this.logger.error(`Error creating booking: ${error.message}`, error.stack);
            if (error instanceof BadRequestException) {
                throw error; // Re-throw client-side errors
            }
            throw new InternalServerErrorException('Failed to create booking or send confirmation email.');
        }
    }

    private async sendBookingConfirmationEmail(booking: Booking): Promise<void> {
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
        }
    }

    // --- UPDATED LOGIC FOR findUserBookings ---

    async findUserBookings(userId: number): Promise<{ studioBookings: Booking[], serviceBookings: ServiceBooking[] }> {
        try {
            // Fetch studio bookings
            const studioBookings = await this.studioBookingsRepository.find({
                where: { user: { id: userId } },
                order: { date: 'DESC', time: 'ASC' },
            });

            // Fetch service bookings
            const serviceBookings = await this.serviceBookingsRepository.find({
                where: { user: { id: userId } }, // Assuming ServiceBooking also has a 'user' relationship or 'userId' field
                order: { date: 'DESC', time: 'ASC' },
            });

            return { studioBookings, serviceBookings };

        } catch (error) {
            this.logger.error(`Error fetching bookings for user ${userId}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to fetch user bookings.');
        }
    }

    // --- END OF UPDATED LOGIC ---
}