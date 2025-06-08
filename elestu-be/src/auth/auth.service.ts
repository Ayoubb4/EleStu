// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport';

interface NodemailerOptions {
    host: string; port: number; secure: boolean; auth: { user: string; pass: string; };
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private transporter: nodemailer.Transporter<SentMessageInfo>;
    private googleClient: OAuth2Client;

    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('EMAIL_HOST'),
            port: this.configService.get<number>('EMAIL_PORT'),
            secure: this.configService.get<string>('EMAIL_SECURE') === 'true',
            auth: {
                user: this.configService.get<string>('EMAIL_USER'),
                pass: this.configService.get<string>('EMAIL_PASS'),
            },
        } as NodemailerOptions);

        const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
        if (!googleClientId) {
            throw new Error('GOOGLE_CLIENT_ID no está definido en el archivo .env');
        }
        this.googleClient = new OAuth2Client(googleClientId);
    }

    async login(loginData: { email: string; password:string }) {
        const user = await this.userService.findByEmail(loginData.email);
        if (!user || user.password !== loginData.password) {
            throw new UnauthorizedException('Credenciales inválidas');
        }
        const payload = { id: user.id, email: user.email };
        const accessToken = this.jwtService.sign(payload);
        const { password, ...userWithoutPassword } = user;
        return { success: true, user: userWithoutPassword, token: accessToken };
    }

    async loginWithGoogle(token: string) {
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken: token,
                audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
            });

            const payload: TokenPayload | undefined = ticket.getPayload();
            if (!payload || !payload.email) {
                throw new UnauthorizedException('No se pudo obtener la información del usuario desde Google.');
            }

            const { name, email, given_name, family_name } = payload;
            this.logger.log(`Token de Google verificado para: ${email}`);

            let user = await this.userService.findByEmail(email);

            if (!user) {
                this.logger.log(`Usuario con email ${email} no existe. Creando nuevo usuario...`);
                const randomPassword = crypto.randomBytes(16).toString('hex');

                // --- CORRECCIÓN CLAVE AQUÍ ---
                // Si Google no proporciona un nombre, usamos la parte local del email como fallback.
                const userNameFromGoogle = name || given_name;
                const finalUserName = userNameFromGoogle || email.split('@')[0];
                // --- FIN DE LA CORRECCIÓN ---

                const createdUser = await this.userService.create({
                    email,
                    name: finalUserName, // Usamos el nombre final asegurado
                    lastName: family_name || '',
                    password: randomPassword,
                });

                user = await this.userService.findById(createdUser.id);
            }

            if (!user) {
                throw new InternalServerErrorException('No se pudo crear o encontrar al usuario después del login con Google.');
            }

            this.logger.log(`Login con Google exitoso para: ${user.email}`);
            const jwtPayload = { id: user.id, email: user.email };
            const accessToken = this.jwtService.sign(jwtPayload);

            const { password, ...userWithoutPassword } = user;

            return { success: true, user: userWithoutPassword, token: accessToken };
        } catch (error) {
            this.logger.error('Error durante la verificación del token de Google:', error);
            throw new UnauthorizedException('Token de Google inválido o caducado.');
        }
    }

    async sendEmailVerificationCode(oldEmail: string, newEmail: string) {
        const user = await this.userService.findByEmail(oldEmail);
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const mailOptions = {
            from: `"EleStu Soporte" <${this.configService.get<string>('EMAIL_USER')}>`,
            to: oldEmail,
            subject: 'Tu Código de Verificación para Cambio de Correo',
            text: `Hola ${user.name},\n\nUsa el siguiente código para confirmar el cambio:\n\nCódigo de Verificación: ${verificationCode}\n\nGracias,\nEl equipo de EleStu`,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            return { success: true, message: 'Se ha enviado un código de verificación a tu correo actual.' };
        } catch (error) {
            throw new InternalServerErrorException('No se pudo enviar el correo de verificación.');
        }
    }

    async verify() {
        return { isValid: true, message: 'Token de autenticación es válido.' };
    }

    async forgotPassword(email: string) {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            return { success: true, message: 'Si existe una cuenta asociada a este correo, recibirás un email con instrucciones.' };
        }

        const mailOptions = {
            from: `"EleStu Soporte" <${this.configService.get<string>('EMAIL_USER')}>`,
            to: email,
            subject: 'Recuperación de Contraseña',
            text: `¡Hola ${user.name}! 👋\n\nTu contraseña actual es: ${user.password}\n\nTe recomendamos cambiarla desde tu perfil.\n\nUn abrazo,\nEl equipo de EleStu 💙`,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            return { success: true, message: 'Si existe una cuenta asociada a este correo, recibirás un email con instrucciones.' };
        } catch (error) {
            throw new InternalServerErrorException('No se pudo procesar la solicitud de recuperación de contraseña.');
        }
    }
}
