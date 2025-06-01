//src/studios/studio.controller.ts
import { Controller, Get } from '@nestjs/common';
import { GooglePlacesService } from './google-places.service';

@Controller('studios')
export class StudioController {
    constructor(private googlePlacesService: GooglePlacesService) {}

    @Get()
    async getStudios() {
        return this.googlePlacesService.searchRecordingStudiosInSpain();
    }
}

