import { Injectable, UnauthorizedException, Logger, NotFoundException } from '@nestjs/common';
import { UserService } from '../users/user.service';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo, Options } from 'nodemailer/lib/smtp-transport';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private transporter: nodemailer.Transporter<SentMessageInfo, Options>;

    constructor(private userService: UserService) {
        // Configurar el transporter de nodemailer
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'elestu777@gmail.com',
                pass: 'dhhgznilxrqogsag',
            },
        });
    }

    async login(loginData: { email: string; password: string }) {
        this.logger.log(`Intento de inicio de sesión para: ${loginData.email}`);

        // Buscar usuario por email
        const user = await this.userService.findByEmail(loginData.email);

        // Verificar si el usuario existe y la contraseña coincide
        if (!user || user.password !== loginData.password) {
            this.logger.warn(`Inicio de sesión fallido para: ${loginData.email}`);
            throw new UnauthorizedException('Credenciales inválidas');
        }

        this.logger.log(`Inicio de sesión exitoso para: ${loginData.email}`);

        // Eliminar la contraseña del objeto de respuesta
        const { password, ...userWithoutPassword } = user;

        return {
            success: true,
            user: userWithoutPassword
        };
    }

    async verify() {
        // Esta función simplemente devuelve true para simular verificación
        return { isValid: true };
    }

    async forgotPassword(email: string) {
        this.logger.log(`Solicitud de recuperación de contraseña para: ${email}`);

        // Buscar usuario por email
        const user = await this.userService.findByEmail(email);

        if (!user) {
            this.logger.warn(`Usuario no encontrado: ${email}`);
            throw new NotFoundException('No existe un usuario con este correo electrónico');
        }

        // Enviar correo con la contraseña
        const mailOptions = {
            from: 'elestu777@gmail.com',
            to: email,
            subject: 'Recuperación de contraseña',
            text: `¡Hola ${user.name}! 👋\n\nHemos recibido una solicitud para restablecer tu contraseña.  
                Aquí tienes tu contraseña:\n\n🔐 Contraseña: ${user.password}\n\nTe recomendamos cambiarla por una personalizada desde tu perfil en cuanto accedas.\n\nSi tú no solicitaste este cambio, por favor contáctanos de inmediato.\n\nUn abrazo,\nEl equipo de EleStu 💙`
        };


        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Correo de recuperación enviado a: ${email}`);
            return { success: true, message: 'Se ha enviado un correo con tu contraseña' };
        } catch (error) {
            this.logger.error(`Error al enviar correo: ${error.message}`, error.stack);
            throw new Error('No se pudo enviar el correo de recuperación');
        }
    }
}