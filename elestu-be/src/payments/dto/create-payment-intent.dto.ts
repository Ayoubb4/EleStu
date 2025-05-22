import { IsNumber, IsString, IsNotEmpty, Min, IsOptional } from 'class-validator';

export class CreatePaymentIntentDto {
    @IsNumber()
    @Min(50) // Monto mínimo para Stripe (ej: 0.50 EUR)
    amount: number;

    @IsString()
    @IsNotEmpty()
    currency: string; // ej: 'eur'

    @IsString()
    @IsNotEmpty()
    serviceTitle: string; // Para metadatos y email de confirmación

    @IsString()
    @IsOptional() // Puede ser opcional si no siempre hay un usuario logueado
    userId?: string; // NUEVO: ID del usuario registrado
}
