// src/bookings/bookings.controller.ts
import {Controller, Post, Body, Res, HttpStatus, Logger, UseGuards, Get, Req} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Response } from 'express';
import {AuthGuard} from "@nestjs/passport";

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

    @UseGuards(AuthGuard('jwt')) // Protege esta ruta, solo usuarios autenticados pueden acceder
    @Get('my') // Define la ruta GET /api/bookings/my
    async findMyBookings(@Req() req: any, @Res() res: Response) {
        // req.user contendrá la información del usuario autenticado gracias al JwtStrategy
        const userId = req.user.id;
        this.logger.log(`Fetching bookings for user ID: ${userId}`);
        try {
            const { studioBookings, serviceBookings } = await this.bookingsService.findUserBookings(userId);
            return res.status(HttpStatus.OK).json({ studioBookings, serviceBookings });
        } catch (error) {
            this.logger.error(`Failed to fetch user bookings: ${error.message}`, error.stack);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: error.message || 'Error fetching user bookings.',
            });
        }
    }

}