// src/services/services.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Service } from './service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { User } from '../users/user.entity';

@Injectable()
export class ServicesService {
  constructor(
      @InjectRepository(Service)
      private serviceRepository: Repository<Service>,
      @InjectRepository(User)
      private userRepository: Repository<User>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const service = new Service();
    service.title = createServiceDto.title;
    service.description = createServiceDto.description;
    service.price = createServiceDto.price;
    // La imagen ya viene como texto Base64, la guardamos directamente
    service.image = createServiceDto.image;
    service.serviceType = createServiceDto.serviceType;

    const usuario = await this.userRepository.findOne({
      where: { id: createServiceDto.userid },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${createServiceDto.userid} no encontrado`);
    }
    service.user = usuario;
    // Simplemente guardamos y devolvemos. No hay que construir ninguna URL.
    return this.serviceRepository.save(service);
  }

  async findAll(serviceType?: string): Promise<Service[]> {
    const options: FindManyOptions<Service> = {
      relations: ['user'],
      order: { id: 'DESC' }
    };

    if (serviceType) {
      options.where = { serviceType: serviceType };
    }
    return this.serviceRepository.find(options);
  }

  async findServicesByUserId(userId: number): Promise<Service[]> {
    return this.serviceRepository.find({
      where: {
        user: { id: userId }
      },
      relations: ['user'],
      order: { id: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!service) {
      throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    }
    return service;
  }

  async update(id: number, updateServiceDto: any): Promise<Service> {
    const service = await this.serviceRepository.preload({
      id: id,
      ...updateServiceDto,
    });
    if (!service) {
      throw new NotFoundException(`Servicio con ID "${id}" no encontrado.`);
    }
    return this.serviceRepository.save(service);
  }

  async remove(id: number): Promise<{ message: string }> {
    const service = await this.findOne(id);
    await this.serviceRepository.remove(service);
    return { message: `Servicio "${service.title}" eliminado correctamente.` };
  }
}