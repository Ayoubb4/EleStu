// src/services/services.controller.ts
import { Controller, Get, Post, Body, Param, UploadedFile, UseInterceptors, Patch, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
// --- AÑADIDO: Importamos el Guard y el decorador de Request ---
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Asumo que se llama así y está en esta ruta. ¡Ajústala si es necesario!

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // --- AÑADIDO: El endpoint para crear servicios ahora también debe estar protegido ---
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
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
  async findAll(@Query('type') type?: string) {
    return this.servicesService.findAll(type);
  }

  // --- AÑADIDO: Nuevo endpoint protegido para obtener los servicios del usuario logueado ---
  @UseGuards(JwtAuthGuard)
  @Get('my-services')
  async findMyServices(@Req() req) {
    // El 'req.user' lo añade el JwtAuthGuard después de validar el token
    const userId = req.user.id;
    return this.servicesService.findServicesByUserId(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.servicesService.findOne(id);
  }

  // --- AÑADIDO: Los endpoints para actualizar y borrar también deben estar protegidos ---
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateServiceDto: any) {
    // Aquí deberíamos añadir lógica para asegurar que solo el dueño del servicio puede editarlo
    return this.servicesService.update(id, updateServiceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    // Aquí deberíamos añadir lógica para asegurar que solo el dueño del servicio puede borrarlo
    return this.servicesService.remove(id);
  }
}