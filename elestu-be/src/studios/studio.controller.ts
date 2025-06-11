// src/studios/studio.controller.ts
import { Controller, Get, Query } from '@nestjs/common'; // Añadido: Query
import { GooglePlacesService } from './google-places.service';

@Controller('studios')
export class StudioController {
    constructor(private googlePlacesService: GooglePlacesService) {}

    @Get()
    async getStudios(@Query('city') city?: string) {
        // Le pasamos la ciudad (o undefined si no viene) al servicio
        return this.googlePlacesService.searchRecordingStudios(city);
    }
}