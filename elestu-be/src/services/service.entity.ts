// src/services/service.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm'; // Importar OneToMany
import { User } from '../users/user.entity';
import { ServiceBooking } from '../bookings/entities/service-booking.entity'; // Importar ServiceBooking

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
    @JoinColumn({ name: 'userid' })
    user: User;

    // Relación inversa con ServiceBookings
    @OneToMany(() => ServiceBooking, serviceBooking => serviceBooking.service)
    serviceBookings: ServiceBooking[]; // Esta es la propiedad que faltaba
}