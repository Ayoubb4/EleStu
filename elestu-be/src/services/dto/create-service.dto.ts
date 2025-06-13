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

    @IsString()
    @IsOptional()
        // --- AÑADIDO: Comentamos la línea original para no borrarla ---
        // image: string;
        // --- AÑADIDO: Nueva línea que permite que la imagen sea de tipo string O null ---
    image: string | null;


    @IsNumber()
    @IsNotEmpty()
    userid: number;

    @IsString()
    @IsNotEmpty()
    serviceType: string;
}