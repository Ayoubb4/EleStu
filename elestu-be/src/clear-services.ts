// src/clear-services.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Service } from './services/service.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

async function bootstrap() {
    console.log('🚀 Iniciando script para limpiar la tabla de servicios...');
    const app = await NestFactory.createApplicationContext(AppModule);

    const serviceRepository = app.get<Repository<Service>>(getRepositoryToken(Service));

    try {
        console.log('🗑️  Borrando todos los registros de la tabla "Servicios"...');
        await serviceRepository.clear(); // Esto ejecuta un TRUNCATE, es muy rápido.
        console.log('✅ Tabla "Servicios" limpiada con éxito.');
    } catch (error) {
        console.error('🔥 Error al limpiar la tabla:', error);
    } finally {
        await app.close();
        console.log('🔌 Conexión cerrada.');
    }
}

bootstrap();