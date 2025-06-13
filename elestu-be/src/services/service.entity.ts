// src/services/service.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { ServiceBooking } from '../bookings/entities/service-booking.entity';

@Entity('Servicios')
export class Service {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    price: number;

    // --- CORRECCIÓN DEFINITIVA ---
    // Especificamos explícitamente el tipo de columna para la base de datos ('varchar' o 'text')
    // y el tipo en TypeScript ('string | null') para que no haya ninguna confusión.
    @Column({ type: 'text', nullable: true })
    image: string | null;

    @Column({ default: 'Otro' })
    serviceType: string;

    @ManyToOne(() => User, user => user.servicios)
    @JoinColumn({ name: 'userid' })
    user: User;

    @OneToMany(() => ServiceBooking, serviceBooking => serviceBooking.service)
    serviceBookings: ServiceBooking[];
}