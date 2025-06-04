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

    @Column({ type: 'varchar', length: 100, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 100 })
    password: string;

    // --- AÑADIDO ---
    @Column({ type: 'varchar', length: 20, nullable: true }) // La columna ya existe en tu BD y es nullable
    phoneNumber?: string; // Hacemos la propiedad opcional en la entidad también
    // --- FIN DE LA ADICIÓN ---

    @OneToMany(() => Service, service => service.user)
    servicios: Service[];

    @OneToMany(() => Booking, booking => booking.user)
    bookings: Booking[];

    @OneToMany(() => ServiceBooking, serviceBooking => serviceBooking.user)
    serviceBookings: ServiceBooking[];
}