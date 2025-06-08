// src/users/user.service.ts
import {
    Injectable,
    ConflictException,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    UnauthorizedException,
    BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePersonalInfoDTO } from './dto/update-personal-info.dto';
import { UpdateSecurityInfoDTO } from './dto/update-security-info.dto';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    // --- Método 'findAll' que faltaba ---
    async findAll(): Promise<Omit<User, 'password'>[]> {
        // Seleccionamos explícitamente los campos para no exponer la contraseña
        return this.userRepository.find({
            select: ['id', 'name', 'lastName', 'email', 'phoneNumber'],
        });
    }

    async findById(id: number): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
        const existingUser = await this.findByEmail(createUserDto.email);
        if (existingUser) {
            throw new ConflictException('El email ya está registrado');
        }
        // ADVERTENCIA DE SEGURIDAD: Hashea la contraseña antes de guardarla.
        const newUser = this.userRepository.create(createUserDto);
        const savedUser = await this.userRepository.save(newUser);
        const { password, ...result } = savedUser;
        return result;
    }

    async updatePersonalInfo(userId: number, data: UpdatePersonalInfoDTO): Promise<Omit<User, 'password'>> {
        const user = await this.findById(userId);
        if (!user) {
            throw new NotFoundException('Usuario no encontrado.');
        }

        Object.assign(user, data);
        const updatedUser = await this.userRepository.save(user);
        const { password, ...result } = updatedUser;
        return result;
    }

    async updateSecurityInfo(userId: number, data: UpdateSecurityInfoDTO): Promise<{ message: string }> {
        const user = await this.findById(userId);
        if (!user) {
            throw new NotFoundException('Usuario no encontrado.');
        }

        if (data.currentPassword !== user.password) {
            throw new UnauthorizedException('La contraseña actual es incorrecta.');
        }

        let hasChanges = false;
        if (data.newEmail && data.newEmail !== user.email) {
            const emailExists = await this.findByEmail(data.newEmail);
            if (emailExists && emailExists.id !== userId) {
                throw new ConflictException('El nuevo correo electrónico ya está en uso por otro usuario.');
            }
            user.email = data.newEmail;
            hasChanges = true;
        }

        if (data.newPassword) {
            user.password = data.newPassword;
            hasChanges = true;
        }

        if (!hasChanges) {
            throw new BadRequestException('No se proporcionaron nuevos datos de email o contraseña para actualizar.');
        }

        await this.userRepository.save(user);
        return { message: 'Tus datos de seguridad han sido actualizados correctamente.' };
    }

    // --- Método 'updateEmail' que faltaba ---
    async updateEmail(currentEmail: string, newEmail: string, verificationCode: string): Promise<User> {
        this.logger.log(`Verificando código ${verificationCode} (simulado)`);
        const user = await this.findByEmail(currentEmail);
        if (!user) {
            throw new NotFoundException('Usuario con el correo actual no encontrado.');
        }
        const emailExists = await this.findByEmail(newEmail);
        if (emailExists && emailExists.id !== user.id) {
            throw new ConflictException('El nuevo correo electrónico ya está en uso.');
        }
        user.email = newEmail;
        return this.userRepository.save(user);
    }

    // --- Método 'updatePassword' que faltaba ---
    async updatePassword(userId: number, currentPassword: string, newPassword: string): Promise<{ message: string }> {
        const user = await this.findById(userId);
        if (!user) {
            throw new NotFoundException('Usuario no encontrado.');
        }
        if (user.password !== currentPassword) {
            throw new UnauthorizedException('La contraseña actual es incorrecta.');
        }
        user.password = newPassword;
        await this.userRepository.save(user);
        return { message: 'Contraseña actualizada correctamente.' };
    }
}
