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

    // --- CORREGIDO AQUÍ ---
    // Si la columna es nullable, el tipo en TypeScript debe ser `string | null`.
    @Column({ nullable: true })
    image: string | null;

    @Column({ type: 'varchar', nullable: true })
    serviceType?: string;

    @ManyToOne(() => User, user => user.servicios)
    @JoinColumn({ name: 'userid' })
    user: User;

    @OneToMany(() => ServiceBooking, serviceBooking => serviceBooking.service)
    serviceBookings: ServiceBooking[];
}
