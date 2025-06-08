// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../users/user.service';
import { User } from '../users/user.entity'; // Importar la entidad User

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService, // Cambiado a readonly, buena práctica
        private readonly userService: UserService,   // Cambiado a readonly, buena práctica
    ) {
        // --- CORRECCIÓN AQUÍ ---
        // 1. Obtenemos el secreto primero
        const secret = configService.get<string>('JWT_SECRET');

        // 2. Verificamos si el secreto existe. Si no, la aplicación no debe arrancar.
        if (!secret) {
            throw new Error('JWT_SECRET no está definido en el archivo .env. La aplicación no puede iniciarse de forma segura.');
        }

        // 3. Llamamos a super() con el secreto ya verificado (que ahora es un string)
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
        // --- FIN DE LA CORRECCIÓN ---
    }

    // Este método se llama después de que el token se ha verificado con el secreto.
    // El payload es el objeto que pusimos en el token al crearlo en auth.service.ts
    async validate(payload: { id: number; email: string }): Promise<Omit<User, 'password'>> {
        const user = await this.userService.findById(payload.id);
        if (!user) {
            throw new UnauthorizedException('Token inválido: usuario no encontrado.');
        }
        // NestJS adjuntará este objeto 'user' (sin la contraseña) a `req.user`
        // en las rutas protegidas con AuthGuard('jwt').
        const { password, ...result } = user;
        return result;
    }
}
