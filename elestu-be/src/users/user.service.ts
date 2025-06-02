//src/users/user.service.ts
import {
    Injectable,
    ConflictException,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm'; // 🆕 AÑADIDO FindManyOptions
import { User } from './user.entity';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async findAll(options?: FindManyOptions<User>): Promise<User[]> { // 🆕 AÑADIDO parámetro opcional
        if (options) {
            return this.userRepository.find(options); // 🆕 AÑADIDO: permite pasar filtros
        }
        return this.userRepository.find(); // ⏪ Se mantiene sin cambios si no hay filtros
    }

    async findById(id: number): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async create(userData: any): Promise<any> {
        this.logger.log(`Intentando crear usuario: ${JSON.stringify(userData)}`);

        try {
            // Verificar si el email ya existe
            const existingUser = await this.findByEmail(userData.email);
            if (existingUser) {
                throw new ConflictException('El email ya está registrado');
            }

            // Crear el usuario directamente sin hash
            const newUser = this.userRepository.create({
                name: userData.name,
                email: userData.email,
                password: userData.password, // Guardando la contraseña sin encriptar
            });

            // Guardar en la base de datos
            this.logger.log('Guardando usuario en la base de datos...');
            const savedUser = await this.userRepository.save(newUser);
            this.logger.log(`Usuario guardado con ID: ${savedUser.id}`);

            // Devolver el usuario sin la contraseña
            const { password, ...result } = savedUser;
            return result;
        } catch (error) {
            this.logger.error(`Error al crear usuario: ${error.message}`, error.stack);
            if (error instanceof ConflictException) {
                throw error;
            }

            throw new InternalServerErrorException('Error al crear usuario en la base de datos');
        }
    }

    async updateEmail(oldEmail: string, newEmail: string, verificationCode: string) {
        const user = await this.findByEmail(oldEmail);
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        user.email = newEmail;
        return await this.userRepository.save(user);
    }

    async updatePassword(currentPassword: string, newPassword: string) {
        // Suponiendo que tienes el usuario autenticado y puedes obtener su ID o email
        const user = await this.findByEmail('email_del_usuario_autenticado');
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        if (user.password !== currentPassword) {
            throw new UnauthorizedException('Contraseña actual incorrecta');
        }

        user.password = newPassword;
        return await this.userRepository.save(user); // ✅ CORRECTO
    }


}
