// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../users/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
// --- AÑADIDO: Importamos el Guard que creamos en el paso anterior ---
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
    imports: [
        UserModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
                },
            }),
            inject: [ConfigService],
        }),
    ],
    // --- MODIFICADO: Añadimos el JwtAuthGuard a los providers ---
    providers: [AuthService, JwtStrategy, JwtAuthGuard],
    controllers: [AuthController],
    // --- MODIFICADO: Exportamos el Guard para que otros módulos puedan usarlo ---
    exports: [AuthService, JwtStrategy, PassportModule, JwtAuthGuard],
})
export class AuthModule {}