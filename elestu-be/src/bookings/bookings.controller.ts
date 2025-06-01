// src/bookings/bookings.controller.ts
import { Controller, Post, Body, Res, HttpStatus, Logger } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Response } from 'express';

@Controller('bookings') // This controller will handle requests to /api/bookings
export class BookingsController {
    private readonly logger = new Logger(BookingsController.name);

    constructor(private readonly bookingsService: BookingsService) {}

    @Post()
    async create(@Body() createBookingDto: CreateBookingDto, @Res() res: Response) {
        this.logger.log('Received booking request');
        try {
            const booking = await this.bookingsService.create(createBookingDto);
            return res.status(HttpStatus.CREATED).json({
                message: 'Booking created successfully and confirmation email sent!',
                booking,
            });
        } catch (error) {
            this.logger.error(`Failed to create booking: ${error.message}`, error.stack);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: error.message || 'Error creating booking.',
            });
        }
    }
}