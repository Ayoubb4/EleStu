//src/services/services.controller.ts
import { Controller, Get, Post, Body, Param, UploadedFile, UseInterceptors, Patch, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // Crear un servicio con archivo
  @Post()
  @UseInterceptors(FileInterceptor('image')) // Para procesar el archivo 'image'
  async create(@Body() createServiceDto: CreateServiceDto, @UploadedFile() file: Express.Multer.File) {
    console.log("User ID recibido en el backend:", createServiceDto.userid);
    console.log('Recibiendo solicitud para crear servicio:', createServiceDto);
    if (file) {
      console.log('Archivo recibido:', file.originalname);
      createServiceDto.image = file.filename;
    }
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  async findAll() {
    return this.servicesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.servicesService.findOne(id);
  }

  // --- AÑADIDO: Endpoint para actualizar (editar) un servicio por su ID ---
  @Patch(':id')
  // Lo ideal sería crear un UpdateServiceDto con campos opcionales.
  async update(@Param('id') id: number, @Body() updateServiceDto: any) {
    return this.servicesService.update(id, updateServiceDto);
  }

  // --- AÑADIDO: Endpoint para eliminar un servicio por su ID ---
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.servicesService.remove(id);
  }
}