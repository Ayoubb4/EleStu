// src/services/services.controller.ts
import { Controller, Get, Post, Body, Param, UploadedFile, UseInterceptors, Patch, Delete, Query, UseGuards, Req, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('services')
export class ServicesController {
  // --- AÑADIDO: Un logger para ver qué está pasando ---
  private readonly logger = new Logger(ServicesController.name);

  constructor(private readonly servicesService: ServicesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(@Body() createServiceDto: CreateServiceDto, @UploadedFile() file: Express.Multer.File) {

    // --- LÍNEAS AÑADIDAS: Lógica para manejar tanto archivos como Base64 ---
    if (file) {
      // MÉTODO 1 (CORRECTO): Si se recibe un archivo, guardamos su nombre.
      this.logger.log(`Archivo de imagen recibido: ${file.filename}. Guardando nombre de archivo.`);
      createServiceDto.image = file.filename;
    } else if (createServiceDto.image && createServiceDto.image.startsWith('data:image')) {
      // MÉTODO 2 (PLAN B): Si no hay archivo pero en el campo 'image' hay un texto Base64, lo aceptamos.
      this.logger.log('Texto de imagen en Base64 recibido. Se guardará directamente.');
      // No es necesario hacer nada más, el DTO ya contiene el string Base64.
    } else {
      // SI NO HAY IMAGEN: Nos aseguramos de que el campo sea null.
      this.logger.log('No se ha proporcionado ninguna imagen nueva.');
      createServiceDto.image = null;
    }
    // --- FIN DE LAS LÍNEAS AÑADIDAS ---

    return this.servicesService.create(createServiceDto);
  }

  @Get()
  async findAll(@Query('type') type?: string) {
    return this.servicesService.findAll(type);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-services')
  async findMyServices(@Req() req) {
    const userId = req.user.id;
    return this.servicesService.findServicesByUserId(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.servicesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(@Param('id') id: number, @Body() updateServiceDto: any, @UploadedFile() file: Express.Multer.File) {
    if (file) {
      updateServiceDto.image = file.filename;
    }
    return this.servicesService.update(id, updateServiceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.servicesService.remove(id);
  }
}