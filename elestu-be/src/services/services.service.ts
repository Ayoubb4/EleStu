// src/services/services.service.ts
import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { User } from '../users/user.entity';
// --- AÑADIDO: Idealmente, tendríamos un DTO para la actualización ---
// import { UpdateServiceDto } from './dto/update-service.dto';

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
    // --- AÑADIDO: Guardamos también el tipo de servicio ---
    service.serviceType = createServiceDto.serviceType;

    const usuario = await this.userRepository.findOne({
      where: { id: createServiceDto.userid },
    });

    if (!usuario) {
      // --- MODIFICADO: Lanzamos una excepción más clara ---
      throw new NotFoundException(`Usuario con ID ${createServiceDto.userid} no encontrado`);
    }

    service.user = usuario;

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
      // --- MODIFICADO: Usamos la excepción estándar de NestJS ---
      throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    }
    return service;
  }

  // --- AÑADIDO: Lógica para actualizar (editar) un servicio ---
  async update(id: number, updateServiceDto: any): Promise<Service> {
    // Usamos preload para cargar la entidad existente y aplicar los cambios del DTO
    const service = await this.serviceRepository.preload({
      id: id,
      ...updateServiceDto,
    });
    if (!service) {
      throw new NotFoundException(`Servicio con ID "${id}" no encontrado.`);
    }
    return this.serviceRepository.save(service);
  }

  // --- AÑADIDO: Lógica para eliminar un servicio ---
  async remove(id: number): Promise<{ message: string }> {
    const service = await this.findOne(id); // Reutilizamos findOne para verificar que existe
    await this.serviceRepository.remove(service);
    return { message: `Servicio "${service.title}" eliminado correctamente.` };
  }
}