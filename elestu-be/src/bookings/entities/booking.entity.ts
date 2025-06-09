// src/bookings/entities/booking.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('bookings')
export class Booking {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    studioId: string;

    @Column()
    studioName: string;

    @Column({ type: 'date' })
    date: string;

    @Column({ type: 'time' })
    time: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    pricePerHour: number;

    @Column()
    userEmail: string;

    @ManyToOne(() => User, user => user.bookings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'int' })
    userId: number;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;

    // --- ¡QUITAR ESTA LÍNEA! ---
    // @Column({ default: 'pending' })
    // status: string;
    // --- FIN DE QUITAR ---
}