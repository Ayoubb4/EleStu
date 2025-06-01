// src/bookings/dto/create-booking.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsEmail, IsDateString, IsInt } from 'class-validator'; // Import IsInt, remove IsUUID

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

    @IsInt() // <--- CHANGE HERE: Validate as integer
    @IsNotEmpty()
    userId: number; // <--- CHANGE HERE: TypeScript type is number
}