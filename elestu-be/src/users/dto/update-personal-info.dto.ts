// src/users/dto/update-personal-info.dto.ts
import { IsString, IsOptional, MaxLength, IsPhoneNumber } from 'class-validator';

export class UpdatePersonalInfoDTO {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    lastName?: string;

    @IsOptional()
    @IsPhoneNumber(undefined, { message: 'Por favor, introduce un número de teléfono válido.' })
    @MaxLength(20)
    phoneNumber?: string;
}
