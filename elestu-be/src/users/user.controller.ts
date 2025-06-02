//src/users/user.controller.ts
import {Controller, Get, Param, Post, Body, Logger, Patch} from '@nestjs/common'
import { UserService } from './user.service'

@Controller('users')
export class UserController {
    private readonly logger = new Logger(UserController.name);

    constructor(private userService: UserService) {}

    @Get()
    findAll() {
        return this.userService.findAll();
    }

    @Get(':id')
    findById(@Param('id') id: string) {
        return this.userService.findById(parseInt(id));
    }

    @Post('register')
    async register(@Body() userData: any) {
        this.logger.log(`Solicitud de registro recibida: ${JSON.stringify(userData)}`);
        try {
            const result = await this.userService.create(userData);
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
    async changeEmail(@Body() data: { oldEmail: string; newEmail: string; verificationCode: string }) {
        this.logger.log(`Solicitud de cambio de correo de: ${data.oldEmail} a ${data.newEmail}`);
        try {
            return await this.userService.updateEmail(data.oldEmail, data.newEmail, data.verificationCode);
        } catch (error) {
            this.logger.error(`Error al cambiar el correo: ${error.message}`);
            throw error;
        }
    }

    @Patch('change-password')
    async changePassword(@Body() data: { currentPassword: string; newPassword: string }) {
        this.logger.log(`Solicitud de cambio de contraseña`);
        try {
            return await this.userService.updatePassword(data.currentPassword, data.newPassword);
        } catch (error) {
            this.logger.error(`Error al cambiar la contraseña: ${error.message}`);
            throw error;
        }
    }


}
