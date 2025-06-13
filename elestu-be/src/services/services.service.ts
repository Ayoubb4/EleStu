// src/services/services.service.ts
import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Service } from './service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { User } from '../users/user.entity';

// --- AÑADIDO: Función de ayuda para construir la URL de la imagen ---
// La sacamos fuera para poder reutilizarla y mantener el código limpio.
const mapServiceToDto = (service: Service): Service => {
  if (service.image) {
    // Construye la URL completa. Usa la variable APP_URL que añadiste a tu .env
    const imageUrl = `${process.env.APP_URL}/api/uploads/${service.image}`;
    return { ...service, image: imageUrl };
  }
  return service;
};

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
    service.image = createServiceDto.image;
    service.serviceType = createServiceDto.serviceType;

    const usuario = await this.userRepository.findOne({
      where: { id: createServiceDto.userid },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${createServiceDto.userid} no encontrado`);
    }
    service.user = usuario;

    const newService = await this.serviceRepository.save(service);

    // --- AÑADIDO: Devolvemos el servicio con la URL de la imagen ya construida ---
    return mapServiceToDto(newService);
  }

  async findAll(serviceType?: string): Promise<Service[]> {
    const options: FindManyOptions<Service> = {
      relations: ['user'],
      order: { id: 'DESC' }
    };

    if (serviceType) {
      options.where = { serviceType: serviceType };
    }
    const services = await this.serviceRepository.find(options);
    // --- AÑADIDO: Mapeamos los resultados para construir la URL de cada imagen ---
    return services.map(mapServiceToDto);
  }

  // --- AÑADIDO: Nueva función para buscar servicios por el ID del usuario ---
  async findServicesByUserId(userId: number): Promise<Service[]> {
    const services = await this.serviceRepository.find({
      where: {
        user: { id: userId }
      },
      relations: ['user'],
      order: { id: 'DESC' }
    });
    // --- AÑADIDO: Mapeamos también aquí para construir la URL ---
    return services.map(mapServiceToDto);
  }

  async findOne(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!service) {
      throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    }
    // --- AÑADIDO: Devolvemos el servicio con la URL de la imagen construida ---
    return mapServiceToDto(service);
  }

  async update(id: number, updateServiceDto: any): Promise<Service> {
    const service = await this.serviceRepository.preload({
      id: id,
      ...updateServiceDto,
    });
    if (!service) {
      throw new NotFoundException(`Servicio con ID "${id}" no encontrado.`);
    }
    const updatedService = await this.serviceRepository.save(service);
    // --- AÑADIDO: Devolvemos el servicio actualizado con la URL construida ---
    return mapServiceToDto(updatedService);
  }

  async remove(id: number): Promise<{ message: string }> {
    const service = await this.findOne(id);
    await this.serviceRepository.remove(service);
    return { message: `Servicio "${service.title}" eliminado correctamente.` };
  }
}