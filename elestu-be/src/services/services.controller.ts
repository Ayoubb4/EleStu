// src/services/services.controller.ts
import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  // Ya no necesitamos UseInterceptors ni UploadedFile
  async create(@Body() createServiceDto: CreateServiceDto) {
    // La imagen ya viene como texto Base64 en el DTO
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
  async update(@Param('id') id: number, @Body() updateServiceDto: any) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.servicesService.remove(id);
  }
}