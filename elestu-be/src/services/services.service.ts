// src/services/services.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Service } from './service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { User } from '../users/user.entity';

// --- AÑADIDO: Función "Guardiana" para asegurar que la URL/dato de la imagen es siempre correcto ---
const mapServiceToDto = (service: Service): Service => {
  // Si el campo 'image' existe, pero NO es una URL http y TAMPOCO es un dato Base64...
  // Esto solo pasaría si en el futuro volvemos a usar subida de archivos.
  if (service.image && !service.image.startsWith('http') && !service.image.startsWith('data:image')) {
    const imageUrl = `${process.env.APP_URL}/uploads/${service.image}`;
    return { ...service, image: imageUrl };
  }

  // Si la imagen es null, o ya es una URL, o es un dato Base64, la devuelve tal cual, sin modificarla.
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

    // --- AÑADIDO: Devolvemos el servicio pasando por la función guardiana ---
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
    // --- AÑADIDO: Mapeamos los resultados para que pasen por la función guardiana ---
    return services.map(mapServiceToDto);
  }

  async findServicesByUserId(userId: number): Promise<Service[]> {
    const services = await this.serviceRepository.find({
      where: {
        user: { id: userId }
      },
      relations: ['user'],
      order: { id: 'DESC' }
    });
    // --- AÑADIDO: Mapeamos también aquí ---
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
    // --- AÑADIDO: Pasamos por la función guardiana ---
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
    // --- AÑADIDO: Pasamos por la función guardiana ---
    return mapServiceToDto(updatedService);
  }

  async remove(id: number): Promise<{ message: string }> {
    const service = await this.findOne(id);
    await this.serviceRepository.remove(service);
    return { message: `Servicio "${service.title}" eliminado correctamente.` };
  }
}