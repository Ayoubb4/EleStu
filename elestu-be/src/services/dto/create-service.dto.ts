// src/services/dto/create-service.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateServiceDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    price: number; // Price can be 0, so IsNotEmpty might not be ideal if 0 is a valid price.

    @IsOptional() // La imagen puede ser opcional
    @IsString()
    image?: string;

    @IsNumber()
    @IsNotEmpty()
    userid: number; // Usuario ID

    // --- AÑADIDO ---
    @IsOptional()
    @IsString()
    serviceType?: string; // El tipo de servicio, ej: 'Cantante', 'Productor', etc.
    // --- FIN DE LA ADICIÓN ---
}
