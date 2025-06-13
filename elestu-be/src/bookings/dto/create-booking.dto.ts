// src/bookings/dto/create-booking.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsEmail, IsDateString, IsInt, IsOptional, IsObject } from 'class-validator'; // AÑADIDO: IsOptional, IsObject

export class CreateBookingDto {
    @IsString()
    @IsNotEmpty()
    studioId: string;

    @IsString()
    @IsNotEmpty()
    studioName: string;

    @IsDateString()
    @IsNotEmpty()
    date: string;

    @IsString()
    @IsNotEmpty()
    time: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @IsNotEmpty()
    pricePerHour: number;

    @IsEmail()
    @IsNotEmpty()
    userEmail: string;

    @IsInt()
    @IsNotEmpty()
    userId: number;

    // --- AÑADIDO: Propiedades para la dirección y ubicación que usará el email ---
    // Las marcamos como opcionales para que no sean obligatorias en todas las peticiones.
    @IsString()
    @IsOptional()
    address?: string;

    @IsObject()
    @IsOptional()
    location?: { lat: number; lng: number };
}