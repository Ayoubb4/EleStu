//src/services/services.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // Crear un servicio
  @Post()
  async create(@Body() createServiceDto: CreateServiceDto) {
    console.log("User ID recibido en el backend:", createServiceDto.userid);
    console.log('Recibiendo solicitud para crear servicio:', createServiceDto);
    return this.servicesService.create(createServiceDto);
  }

  // Obtener todos los servicios
  @Get()
  async findAll() {
    return this.servicesService.findAll();
  }

  // Obtener un servicio por su ID
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.servicesService.findOne(id);
  }
}
