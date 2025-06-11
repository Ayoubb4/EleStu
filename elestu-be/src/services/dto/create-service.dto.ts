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
    @IsNotEmpty()
    price: number;

    // --- MODIFICADO: La imagen es opcional, así que usamos @IsOptional ---
    @IsString()
    @IsOptional()
    image: string;

    @IsNumber()
    @IsNotEmpty()
    userid: number;

    // --- AÑADIDO: La propiedad que faltaba para el tipo de servicio ---
    @IsString()
    @IsNotEmpty()
    serviceType: string;
}