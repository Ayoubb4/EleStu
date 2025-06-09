// src/bookings/entities/service-booking.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { Service } from '../../services/service.entity';

@Entity('service_bookings')
export class ServiceBooking {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Service, service => service.serviceBookings, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'serviceId' })
    service: Service;

    @Column()
    serviceId: number;

    @ManyToOne(() => User, user => user.serviceBookings, {
        onDelete: 'SET NULL',
        nullable: true
    })
    @JoinColumn({ name: 'userId' })
    user: User | null;

    @Column({ nullable: true })
    userId: number | null;

    @Column()
    userEmail: string;

    @Column()
    serviceTitle: string;

    @Column({ type: 'date' })
    date: string;

    @Column({ type: 'time', nullable: true })
    time: string | null;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    price: number;

    // --- ¡QUITAR ESTA LÍNEA! ---
    // @Column({ default: 'pending' })
    // status: string;
    // --- FIN DE QUITAR ---

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;
}