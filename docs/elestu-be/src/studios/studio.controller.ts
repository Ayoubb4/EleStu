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

    async create(data: Partial<Studio>) {
        const studio = this.studioRepository.create(data);
        return this.studioRepository.save(studio);
    }

    async findAll() {
        return this.studioRepository.find();
    }
}