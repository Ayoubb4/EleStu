import { IsNumber, IsString, IsNotEmpty, Min } from 'class-validator';

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
}