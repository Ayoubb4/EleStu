// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport';
import { ConfigService } from '@nestjs/config'; // Importar ConfigService

// Definición explícita de las opciones para mayor claridad
interface NodemailerOptions {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private transporter: nodemailer.Transporter<SentMessageInfo>;

    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private configService: ConfigService, // Inyectar ConfigService
    ) {
        // --- CORREGIDO: Configurar el transporter de nodemailer usando ConfigService ---
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('EMAIL_HOST'),
            port: this.configService.get<number>('EMAIL_PORT'),
            secure: this.configService.get<string>('EMAIL_SECURE') === 'true', // Convertir string a boolean
            auth: {
                user: this.configService.get<string>('EMAIL_USER'),
                pass: this.configService.get<string>('EMAIL_PASS'),
            },
        } as NodemailerOptions);
    }

    async login(loginData: { email: string; password:string }) {
        this.logger.log(`Intento de inicio de sesión para: ${loginData.email}`);
        const user = await this.userService.findByEmail(loginData.email);

        // ADVERTENCIA DE SEGURIDAD: Compara contraseñas en texto plano.
        if (!user || user.password !== loginData.password) {
            this.logger.warn(`Inicio de sesión fallido para: ${loginData.email}`);
            throw new UnauthorizedException('Credenciales inválidas');
        }

        this.logger.log(`Inicio de sesión exitoso para: ${loginData.email}`);

        const payload = { id: user.id, email: user.email };
        const accessToken = this.jwtService.sign(payload);
        this.logger.log(`Token generado para el usuario ID: ${user.id}`);

        const { password, ...userWithoutPassword } = user;

        return {
            success: true,
            user: userWithoutPassword,
            token: accessToken,
        };
    }

    async sendEmailVerificationCode(oldEmail: string, newEmail: string) {
        const user = await this.userService.findByEmail(oldEmail);
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        this.logger.log(`Generado código de verificación ${verificationCode} para el cambio de email de ${oldEmail} a ${newEmail}`);

        const mailOptions = {
            from: `"EleStu Soporte" <${this.configService.get<string>('EMAIL_USER')}>`,
            to: oldEmail,
            subject: 'Tu Código de Verificación para Cambio de Correo',
            text: `Hola ${user.name},\n\nHas solicitado cambiar tu correo electrónico. Usa el siguiente código para confirmar el cambio:\n\nCódigo de Verificación: ${verificationCode}\n\nSi no has solicitado este cambio, por favor ignora este mensaje o contacta con nuestro soporte.\n\nGracias,\nEl equipo de EleStu`,
            html: `<p>Hola ${user.name},</p><p>Has solicitado cambiar tu correo electrónico. Usa el siguiente código para confirmar el cambio:</p><h3>Código de Verificación: <strong>${verificationCode}</strong></h3><p>Si no has solicitado este cambio, por favor ignora este mensaje o contacta con nuestro soporte.</p><p>Gracias,<br>El equipo de EleStu</p>`,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Código de verificación enviado a: ${oldEmail}`);
            return { success: true, message: 'Se ha enviado un código de verificación a tu correo actual.' };
        } catch (error) {
            this.logger.error(`Error al enviar correo de verificación: ${error.message}`, error.stack);
            throw new InternalServerErrorException('No se pudo enviar el correo de verificación.');
        }
    }

    async verify() {
        this.logger.log('Llamada al endpoint de verificación (pasó el AuthGuard)');
        return { isValid: true, message: 'Token de autenticación es válido.' };
    }

    async forgotPassword(email: string) {
        this.logger.log(`Solicitud de recuperación de contraseña para: ${email}`);
        const user = await this.userService.findByEmail(email);

        if (!user) {
            this.logger.warn(`Intento de recuperación para email no existente: ${email}`);
            return { success: true, message: 'Si existe una cuenta asociada a este correo, recibirás un email con instrucciones.' };
        }

        const mailOptions = {
            from: `"EleStu Soporte" <${this.configService.get<string>('EMAIL_USER')}>`,
            to: email,
            subject: 'Recuperación de Contraseña',
            text: `¡Hola ${user.name}! 👋\n\nHemos recibido una solicitud para recordarte tu contraseña.\n\n🔐 Contraseña: ${user.password}\n\nPor tu seguridad, te recomendamos encarecidamente cambiarla por una nueva desde los ajustes de tu perfil en cuanto accedas.\n\nSi no has solicitado esto, por favor, contacta con nuestro equipo de soporte inmediatamente.\n\nUn abrazo,\nEl equipo de EleStu 💙`,
            html: `<p>¡Hola ${user.name}! 👋</p><p>Hemos recibido una solicitud para recordarte tu contraseña.</p><p>🔐 Contraseña: <strong>${user.password}</strong></p><p>Por tu seguridad, te recomendamos encarecidamente cambiarla por una nueva desde los ajustes de tu perfil en cuanto accedas.</p><p>Si no has solicitado esto, por favor, contacta con nuestro equipo de soporte inmediatamente.</p><p>Un abrazo,<br>El equipo de EleStu 💙</p>`,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Correo de recuperación enviado a: ${email}`);
            return { success: true, message: 'Si existe una cuenta asociada a este correo, recibirás un email con instrucciones.' };
        } catch (error) {
            this.logger.error(`Error al enviar correo de recuperación: ${error.message}`, error.stack);
            throw new InternalServerErrorException('No se pudo procesar la solicitud de recuperación de contraseña.');
        }
    }
}
