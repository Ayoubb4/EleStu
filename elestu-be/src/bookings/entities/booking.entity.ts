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

    // Many-to-one relationship with the User entity
    @ManyToOne(() => User, user => user.bookings, { onDelete: 'CASCADE' }) // This side points to user.bookings
    @JoinColumn({ name: 'userId' }) // The actual column in 'bookings' table
    user: User; // The User object when loaded

    @Column({ type: 'int' }) // Make sure this matches your DB
    userId: number; // The actual ID value

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;
}