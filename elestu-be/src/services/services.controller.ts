// src/services/services.controller.ts
import { Controller, Get, Post, Body, Param, UploadedFile, UseInterceptors, Patch, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(@Body() createServiceDto: CreateServiceDto, @UploadedFile() file: Express.Multer.File) {
    if (file) {
      createServiceDto.image = file.filename;
    }
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
  // --- AÑADIDO: Interceptor de archivos también aquí para poder actualizar la imagen ---
  @UseInterceptors(FileInterceptor('image'))
  async update(@Param('id') id: number, @Body() updateServiceDto: any, @UploadedFile() file: Express.Multer.File) {
    // Si se sube un nuevo archivo, lo añadimos a los datos a actualizar
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