// src/users/user.controller.ts
import { Controller, Get, Param, Post, Body, Logger, Patch, UseGuards, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport'; // Asumiendo que usas Passport con una estrategia JWT llamada 'jwt'
import { UpdatePersonalInfoDTO } from './dto/update-personal-info.dto';
import { UpdateSecurityInfoDTO } from './dto/update-security-info.dto';
// --- RUTA DE IMPORTACIÓN CORREGIDA ---
import { CreateUserDto } from './dto/create-user.dto'; // La ruta correcta es './dto/...'

@Controller('users')
export class UserController {
    private readonly logger = new Logger(UserController.name);

    constructor(private userService: UserService) {}

    @Get()
    findAll() {
        // Este método ahora existirá en UserService
        return this.userService.findAll();
    }

    @Get(':id')
    findById(@Param('id') id: string) {
        return this.userService.findById(parseInt(id, 10));
    }

    @Post('register')
    // Usamos el DTO para validar los datos de entrada del registro
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async register(@Body() createUserDto: CreateUserDto) {
        this.logger.log(`Solicitud de registro recibida para: ${createUserDto.email}`);
        try {
            const result = await this.userService.create(createUserDto);
            this.logger.log('Usuario registrado exitosamente');
            return result;
        } catch (error) {
            this.logger.error(`Error en el registro: ${error.message}`);
            throw error;
        }
    }

    @Get('email/:email')
    async findByEmail(@Param('email') email: string) {
        this.logger.log(`Buscando usuario por email: ${email}`);
        return this.userService.findByEmail(email);
    }

    @Patch('change-email')
    @UseGuards(AuthGuard('jwt')) // Proteger esta ruta también
    async changeEmail(@Req() req: any, @Body() data: { newEmail: string; verificationCode: string }) {
        const userEmail = req.user.email; // Obtener email del usuario autenticado desde el token
        this.logger.log(`Solicitud de cambio de correo de: ${userEmail} a ${data.newEmail}`);
        return this.userService.updateEmail(userEmail, data.newEmail, data.verificationCode);
    }

    @Patch('change-password')
    @UseGuards(AuthGuard('jwt')) // Proteger esta ruta
    async changePassword(@Req() req: any, @Body() data: { currentPassword: string; newPassword: string }) {
        const userId = req.user.id; // Obtener ID del usuario autenticado
        this.logger.log(`Solicitud de cambio de contraseña para el usuario con ID: ${userId}`);
        return this.userService.updatePassword(userId, data.currentPassword, data.newPassword);
    }

    @Patch('profile/personal')
    @UseGuards(AuthGuard('jwt'))
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    async updatePersonalInfo(@Req() req: any, @Body() data: UpdatePersonalInfoDTO) {
        const userId = req.user.id;
        this.logger.log(`Usuario con ID ${userId} está actualizando su perfil personal.`);
        return this.userService.updatePersonalInfo(userId, data);
    }

    @Patch('profile/security')
    @UseGuards(AuthGuard('jwt'))
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    async updateSecurityInfo(@Req() req: any, @Body() data: UpdateSecurityInfoDTO) {
        const userId = req.user.id;
        this.logger.log(`Usuario con ID ${userId} está actualizando sus datos de seguridad.`);
        return this.userService.updateSecurityInfo(userId, data);
    }
}
