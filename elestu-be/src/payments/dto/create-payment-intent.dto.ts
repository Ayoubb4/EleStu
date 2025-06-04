// src/payments/dto/create-payment-intent.dto.ts
import { IsNumber, IsString, IsNotEmpty, Min, IsOptional, IsDateString } from 'class-validator';

export class CreatePaymentIntentDto {
    @IsNumber()
    @Min(50) // Monto mínimo para Stripe (ej: 0.50 EUR en céntimos)
    amount: number;

    @IsString()
    @IsNotEmpty()
    currency: string; // ej: 'eur'

    @IsString()
    @IsNotEmpty()
    serviceTitle: string;

    @IsNumber() // Asumimos que serviceId es un número
    @IsNotEmpty()
    serviceId: number; // <--- AÑADIDO

    @IsDateString() // Valida que sea una cadena de fecha (YYYY-MM-DD)
    @IsNotEmpty()
    bookingDate: string; // <--- AÑADIDO

    @IsString() // Puedes usar una validación más específica para la hora si quieres (ej. IsMilitaryTime)
    @IsNotEmpty()
    bookingTime: string; // <--- AÑADIDO (ej: 'HH:MM')

    @IsString()
    @IsNotEmpty() // O IsOptional() si puede estar vacío
    bookingDescription: string; // <--- AÑADIDO

    @IsString() // Si el userId es un string (como UUID)
    // @IsNumberString() // Si el userId es numérico pero viene como string
    // @IsNumber() // Si el userId es un número
    @IsOptional()
    userId?: string; // ID del usuario registrado (mantenlo como string si así lo recibes)
}