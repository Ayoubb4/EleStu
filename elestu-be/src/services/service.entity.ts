// src/services/service.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('Servicios')  // Aquí defines el nombre de la tabla como 'Servicios'
export class Service {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    price: number;

    @Column({ nullable: true })
    image: string;

    @ManyToOne(() => User, user => user.servicios)
    @JoinColumn({ name: 'userid' }) // Esto ya crea la columna userid y la usa internamente
    user: User;
}
