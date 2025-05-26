import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudioService } from './studio.service';
import { Studio } from './studio.entity'; // Asegúrate de que esta ruta sea correcta

@Module({
    imports: [
        TypeOrmModule.forFeature([Studio]) // Registra la entidad Studio
    ],
    providers: [StudioService],
    exports: [StudioService]
})
export class StudioModule {}