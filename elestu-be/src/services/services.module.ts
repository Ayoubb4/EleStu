// src/services/services.module.ts
import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from "./service.entity"; // Asegúrate que la ruta a service.entity es correcta si está en una subcarpeta 'entities'
import { User } from "../users/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Service, User])],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService] // <--- AÑADIDO: Exporta ServicesService para que otros módulos puedan usarlo
})
export class ServicesModule {}