// src/bookings/bookings.service.ts
import { Injectable, InternalServerErrorException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/user.entity'; // Import your User entity

@Injectable()
export class BookingsService {
    private readonly logger = new Logger(BookingsService.name);

    constructor(
        @InjectRepository(Booking)
        private bookingsRepository: Repository<Booking>,
        @InjectRepository(User) // <--- ADD THIS: Inject the User repository
        private usersRepository: Repository<User>,
        private readonly mailerService: MailerService,
    ) {}

    async create(createBookingDto: CreateBookingDto): Promise<Booking> {
        try {
            // 1. Validate if the userId exists in the "Usuarios" table
            const user = await this.usersRepository.findOne({ where: { id: createBookingDto.userId } });
            if (!user) {
                throw new BadRequestException(`User with ID ${createBookingDto.userId} not found.`);
            }

            // 2. Create a new booking instance from DTO
            const newBooking = this.bookingsRepository.create({
                ...createBookingDto,
                user: user, // Link the user entity to the booking relationship
            });

            // 3. Save the booking to the database
            await this.bookingsRepository.save(newBooking);
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
            await this.mailerService.sendMail({
                to: booking.userEmail,
                subject: `Booking Confirmation for ${booking.studioName}`,
                template: 'booking-confirmation',
                context: {
                    studioName: booking.studioName,
                    date: booking.date,
                    time: booking.time,
                    description: booking.description,
                    pricePerHour: booking.pricePerHour,
                    currentYear: new Date().getFullYear(),
                },
            });
            this.logger.log(`Booking confirmation email sent to ${booking.userEmail}`);
        } catch (error) {
            this.logger.error(`Error sending email for booking ${booking.id}: ${error.message}`, error.stack);
        }
    }
}