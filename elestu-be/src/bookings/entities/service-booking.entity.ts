// src/bookings/entities/service-booking.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { Service } from '../../services/service.entity';

@Entity('service_bookings') // Usamos este nombre de tabla, asegúrate que es el correcto en tu DB
export class ServiceBooking {
    @PrimaryGeneratedColumn('uuid') // Mantén 'uuid' si lo usas, o cambia a 'increment'
    id: string;

    // Relación con el Servicio
    @ManyToOne(() => Service, service => service.serviceBookings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'serviceId' })
    service: Service; // Objeto Service relacionado

    @Column() // Necesario para guardar el ID del servicio directamente en la tabla
    serviceId: number;

    // Relación con el Usuario que hace la reserva
    @ManyToOne(() => User, user => user.serviceBookings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User; // Objeto User que hace la reserva

    @Column() // Email del usuario que hace la reserva (para el correo de confirmación)
    userEmail: string;

    // --- CAMPOS DE LA RESERVA (combinados y ajustados para el DTO y el email) ---
    @Column() // Título del servicio (del Service.title)
    serviceTitle: string;

    @Column({ type: 'date' }) // Fecha de la reserva (ajustado de bookingDate)
    date: string;

    @Column({ type: 'time', nullable: true }) // Hora de la reserva (ajustado de bookingTime)
    time: string;

    @Column({ type: 'text', nullable: true }) // <-- FIX: Make description nullable (esto ya estaba en tu original)
    description: string | null; // <-- FIX: Allow null type in TypeScript (esto ya estaba en tu original)

    @Column({ type: 'numeric', precision: 10, scale: 2 }) // Precio en el momento de la reserva (ajustado de priceAtBooking)
    price: number;

    @Column({ default: 'pending' }) // Estado inicial de la reserva
    status: string;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;
}