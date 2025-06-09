// src/bookings/entities/service-booking.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { Service } from '../../services/service.entity';

@Entity('service_bookings')
export class ServiceBooking {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Relación con el Servicio
    @ManyToOne(() => Service, service => service.serviceBookings, { onDelete: 'CASCADE', nullable: false }) // Asumimos que un service_booking siempre tiene un servicio
    @JoinColumn({ name: 'serviceId' })
    service: Service;

    @Column() // Columna FK para serviceId
    serviceId: number;

    // Relación con el Usuario que hace la reserva
    // Si la reserva puede ser de un "invitado" (sin usuario logueado), entonces userId puede ser NULL
    @ManyToOne(() => User, user => user.serviceBookings, {
        onDelete: 'SET NULL', // O 'CASCADE' si prefieres borrar la reserva si el usuario se borra y userId es NOT NULL
        nullable: true      // <--- PERMITE QUE LA RELACIÓN SEA NULA
    })
    @JoinColumn({ name: 'userId' }) // Define la columna FK como 'userId'
    user: User | null;          // <--- PERMITE QUE EL OBJETO USER SEA NULL

    @Column({ nullable: true })   // <--- PERMITE QUE LA COLUMNA userId sea NULL en la BD
    userId: number | null;      // <--- AÑADIDO para la FK explícita y permitir null

    @Column()
    userEmail: string; // Email del usuario que hace la reserva (para el correo de confirmación)

    @Column()
    serviceTitle: string; // Título del servicio

    @Column({ type: 'date' })
    date: string; // Fecha de la reserva

    @Column({ type: 'time', nullable: true }) // La columna en DB puede ser NULL
    time: string | null; // <--- CORREGIDO: Permite que el tipo sea string o null

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    price: number; // Precio en el momento de la reserva

    @Column({ default: 'pending' })
    status: string; // Estado inicial de la reserva

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;
}