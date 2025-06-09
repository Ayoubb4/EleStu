// src/bookings/bookings.controller.ts
import {
    Controller,
    Post,
    Body,
    Res,
    HttpStatus,
    Logger,
    UseGuards,
    Get,
    Req,
    Delete, // <-- Añadido
    Param // <-- Añadido
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Response } from 'express';
import { AuthGuard } from "@nestjs/passport";

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

    @UseGuards(AuthGuard('jwt')) // Protege esta ruta
    @Delete(':type/:id') // Define la ruta DELETE /api/bookings/:type/:id (e.g., /api/bookings/studio/UUID)
    async cancelBooking(
        @Param('type') type: 'studio' | 'service', // Captura 'studio' o 'service'
        @Param('id') id: string,                 // Captura el ID de la reserva
        @Req() req: any,
        @Res() res: Response
    ) {
        const userId = req.user.id; // ID del usuario autenticado
        this.logger.log(`Attempting to cancel ${type} booking with ID: ${id} for user: ${userId}`);
        try {
            const cancelledBooking = await this.bookingsService.cancelBooking(id, type, userId);
            return res.status(HttpStatus.OK).json({
                message: 'Reserva cancelada correctamente.',
                booking: cancelledBooking,
            });
        } catch (error) {
            this.logger.error(`Failed to cancel booking ${id}: ${error.message}`, error.stack);
            const statusCode = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
            return res.status(statusCode).json({
                message: error.message || 'Error al cancelar la reserva.',
            });
        }
    }
}