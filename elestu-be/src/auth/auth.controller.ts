import { Controller, Post, Body, Get, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

    constructor(private authService: AuthService) {}

    @Post('login')
    async login(@Body() loginData: { email: string; password: string }) {
        this.logger.log(`Solicitud de inicio de sesión para: ${loginData.email}`);
        try {
            return await this.authService.login(loginData);
        } catch (error) {
            this.logger.error(`Error en solicitud de login: ${error.message}`);
            throw error;
        }
    }

    @Get('verify')
    async verify() {
        this.logger.log('Solicitud de verificación de autenticación');
        return await this.authService.verify();
    }

    @Post('forgot-password')
    async forgotPassword(@Body() data: { email: string }) {
        this.logger.log(`Solicitud de recuperación de contraseña para: ${data.email}`);
        try {
            return await this.authService.forgotPassword(data.email);
        } catch (error) {
            this.logger.error(`Error en recuperación de contraseña: ${error.message}`);
            throw error;
        }
    }
}