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

    @Column({type: 'float'}) // Usamos float para permitir decimales en el precio
    price: number;

    // --- CORRECCIÓN CLAVE AQUÍ ---
    // La imagen es una URL o una cadena base64, por lo tanto, su tipo es 'string'.
    // También puede ser nula.
    @Column({ type: 'text', nullable: true }) // 'text' permite cadenas muy largas como base64
    image: string | null;

    @Column({ type: 'varchar', nullable: true })
    serviceType?: string;

    @ManyToOne(() => User, user => user.servicios)
    @JoinColumn({ name: 'userid' })
    user: User;

    @OneToMany(() => ServiceBooking, serviceBooking => serviceBooking.service)
    serviceBookings: ServiceBooking[];
}
