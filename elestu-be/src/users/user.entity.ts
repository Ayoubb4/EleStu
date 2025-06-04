// src/users/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Service } from "../services/service.entity";
import { Booking } from '../bookings/entities/booking.entity'; // Import Booking entity
import { ServiceBooking } from '../bookings/entities/service-booking.entity'; // Importar ServiceBooking

@Entity('Usuarios') // Maintain this name as it matches your database table
export class User {
    @PrimaryGeneratedColumn() // This will correctly map to your integer primary key
    id: number; // The type is number, matching your integer ID in DB

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 100 })
    password: string;

    @OneToMany(() => Service, service => service.user)
    servicios: Service[];

    @OneToMany(() => Booking, booking => booking.user) // Esta relación ya existía
    bookings: Booking[]; // Property to hold all bookings associated with this user

    // Relación inversa específica con ServiceBookings
    @OneToMany(() => ServiceBooking, serviceBooking => serviceBooking.user)
    serviceBookings: ServiceBooking[]; // Esta es la propiedad que faltaba para ServiceBooking
}