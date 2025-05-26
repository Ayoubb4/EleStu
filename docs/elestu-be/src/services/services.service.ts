// src/services/services.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { User } from '../users/user.entity';

@Injectable()
export class ServicesService {
  constructor(
      @InjectRepository(Service)
      private serviceRepository: Repository<Service>,
      @InjectRepository(User)  // Inyectamos el repositorio de User
      private userRepository: Repository<User>,
  ) {}

  // Crear un servicio
  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const service = new Service();
    service.title = createServiceDto.title;
    service.description = createServiceDto.description;
    service.price = createServiceDto.price;
    service.image = createServiceDto.image;

    const usuario = await this.userRepository.findOne({
      where: { id: createServiceDto.userid },
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    service.user = usuario; // ⚠️ CAMBIO: el campo correcto es "user", no "usuario"

    return this.serviceRepository.save(service);
  }

  // Obtener todos los servicios
  async findAll(): Promise<Service[]> {
    return this.serviceRepository.find({ relations: ['user'] }); // Cargamos la relación con el usuario
  }

  // Obtener un servicio por su ID
  async findOne(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['user'],  // También cargamos el usuario que creó el servicio
    });
    if (!service) {
      throw new HttpException('Service not found', HttpStatus.NOT_FOUND);
    }
    return service;
  }
}
