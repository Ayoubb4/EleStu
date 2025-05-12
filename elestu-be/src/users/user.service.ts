import { Injectable, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
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
}