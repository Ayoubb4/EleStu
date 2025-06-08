// src/users/dto/update-security-info.dto.ts
import { IsEmail, IsString, MinLength, IsOptional, ValidateIf } from 'class-validator';

export class UpdateSecurityInfoDTO {
    @IsString()
    @MinLength(6, { message: 'La contraseña actual es requerida para verificar tu identidad.' })
    currentPassword: string;

    @IsOptional()
    @IsEmail({}, { message: 'Por favor, introduce un correo electrónico válido.' })
    newEmail?: string;

    @IsOptional()
    @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres.' })
    @ValidateIf(o => o.newPassword && o.newPassword.length > 0) // Solo valida MinLength si no está vacío
    newPassword?: string;
}
