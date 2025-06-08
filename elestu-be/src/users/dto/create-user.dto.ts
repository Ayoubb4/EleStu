// src/users/dto/create-user.dto.ts
import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsPhoneNumber } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    name: string;

    @IsEmail({}, { message: 'Por favor, introduce un correo electrónico válido.' })
    @MaxLength(100)
    email: string;

    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
    @MaxLength(100)
    password: string;

    @IsOptional()
    @IsPhoneNumber(undefined, { message: 'Por favor, introduce un número de teléfono válido.' })
    @MaxLength(20)
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    lastName?: string;
}
