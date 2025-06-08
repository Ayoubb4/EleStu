// src/auth/auth.controller.ts
import { Controller, Post, Body, Get, Logger, Req } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

    constructor(private authService: AuthService) {}

    @Post('login')
    // No necesitamos el objeto 'req' aquí, así que lo quitamos para mayor limpieza.
    async login(@Body() loginData: { email: string; password: string }) {
        this.logger.log(`Solicitud de inicio de sesión para: ${loginData.email}`);
        try {
            // Llamamos al servicio solo con los datos de login.
            return await this.authService.login(loginData);
        } catch (error) {
            this.logger.error(`Error en solicitud de login: ${error.message}`);
            throw error;
        }
    }

    @Post('google')
    // Tampoco necesitamos 'req' aquí. Solo el token que viene en el body.
    async googleLogin(@Body('token') token: string) {
        this.logger.log('Recibida solicitud de login con Google...');
        try {
            // --- CORREGIDO AQUÍ: Se llama a la función solo con 1 argumento ---
            return await this.authService.loginWithGoogle(token);
        } catch (error) {
            this.logger.error(`Error en login con Google: ${error.message}`);
            throw error;
        }
    }

    @Post('request-email-verification')
    async requestEmailVerification(@Body() data: { oldEmail: string; newEmail: string }) {
        this.logger.log(`Solicitud de código de verificación para cambiar el correo de: ${data.oldEmail}`);
        try {
            return await this.authService.sendEmailVerificationCode(data.oldEmail, data.newEmail);
        } catch (error) {
            this.logger.error(`Error al enviar código de verificación: ${error.message}`);
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
