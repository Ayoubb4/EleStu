import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class Studio {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    address: string

    @Column('json')
    location: {
        lat: number
        lng: number
    }

    @Column()
    mapsPlaceId: string
}
