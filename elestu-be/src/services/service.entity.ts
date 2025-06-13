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

    @Column({ nullable: true })
        // --- AÑADIDO: Comentamos la línea original que no permitía null ---
        // image: string;
        // --- AÑADIDO: Nueva línea que permite que la imagen sea de tipo string O null ---
    image: string | null;


    // --- AÑADIDO: La columna que faltaba para el tipo de servicio ---
    @Column({ default: 'Otro' }) // Asignamos un valor por defecto para evitar problemas
    serviceType: string;

    @ManyToOne(() => User, user => user.servicios)
    @JoinColumn({ name: 'userid' })
    user: User;

    @OneToMany(() => ServiceBooking, serviceBooking => serviceBooking.service)
    serviceBookings: ServiceBooking[];
}