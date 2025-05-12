import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Studio } from './studio.entity';

@Injectable()
export class StudioService {
    constructor(
        @InjectRepository(Studio)
        private studioRepository: Repository<Studio>
    ) {}

    // Aquí tus métodos del servicio
}