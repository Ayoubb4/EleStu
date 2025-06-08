// src/users/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Service } from "../services/service.entity";
import { Booking } from '../bookings/entities/booking.entity';
import { ServiceBooking } from '../bookings/entities/service-booking.entity';

@Entity('Usuarios')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    // --- AÑADIDO: Campo para Apellidos ---
    @Column({ type: 'varchar', length: 100, nullable: true })
    lastName?: string;
    // --- FIN DE LA ADICIÓN ---

    @Column({ type: 'varchar', length: 100, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 100 })
    password: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phoneNumber?: string;

    @OneToMany(() => Service, service => service.user)
    servicios: Service[];

    @OneToMany(() => Booking, booking => booking.user)
    bookings: Booking[];

    @OneToMany(() => ServiceBooking, serviceBooking => serviceBooking.user)
    serviceBookings: ServiceBooking[];
}
