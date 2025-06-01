//src/studios/studio.module.ts
import { Module } from '@nestjs/common';
import { GooglePlacesService } from './google-places.service';
import { StudioController } from './studio.controller';

@Module({
    providers: [GooglePlacesService],
    controllers: [StudioController],
})
export class StudioModule {}