// src/services/services.service.ts
import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
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
      @InjectRepository(User)
      private userRepository: Repository<User>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const service = new Service();
    service.title = createServiceDto.title;
    service.description = createServiceDto.description;
    service.price = createServiceDto.price;
    service.serviceType = createServiceDto.serviceType;

    // --- CORREGIDO AQUÍ ---
    // Si createServiceDto.image es undefined, asignamos null.
    service.image = createServiceDto.image || null;

    const usuario = await this.userRepository.findOne({
      where: { id: createServiceDto.userid },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${createServiceDto.userid} no encontrado`);
    }

    service.user = usuario;

    return this.serviceRepository.save(service);
  }

  async findAll(): Promise<Service[]> {
    return this.serviceRepository.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!service) {
      throw new HttpException('Service not found', HttpStatus.NOT_FOUND);
    }
    return service;
  }
}
