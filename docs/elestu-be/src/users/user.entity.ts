//src/users/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { OneToMany } from 'typeorm';
import { Service } from "../services/service.entity";

@Entity('Usuarios') // Si la tabla se llama 'Usuarios', mantenemos este nombre
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 100 })
    password: string;

    @OneToMany(() => Service, service => service.user) // Relación OneToMany con la entidad Service
    servicios: Service[];  // Aquí almacenaremos todos los servicios asociados a un usuario
}
