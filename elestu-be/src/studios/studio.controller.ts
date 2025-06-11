// src/studios/studio.controller.ts
import { Controller, Get, Query, BadRequestException } from '@nestjs/common'; // Añadido: BadRequestException
import { GooglePlacesService } from './google-places.service';

@Controller('studios')
export class StudioController {
    constructor(private googlePlacesService: GooglePlacesService) {}

    // --- MODIFICADO: Ahora puede buscar por texto (city) o por coordenadas (lat, lng) ---
    @Get()
    async getStudios(
        @Query('city') city?: string,
        @Query('lat') lat?: string,
        @Query('lng') lng?: string,
    ) {
        // Si vienen latitud y longitud, usamos la búsqueda por cercanía (la nueva y más rápida)
        if (lat && lng) {
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lng);

            if (isNaN(latitude) || isNaN(longitude)) {
                throw new BadRequestException('Invalid latitude or longitude.');
            }
            return this.googlePlacesService.searchStudiosNearby(latitude, longitude);
        }

        // Si no, usamos la búsqueda por texto como antes
        return this.googlePlacesService.searchRecordingStudios(city);
    }
}