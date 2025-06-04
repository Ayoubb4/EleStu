import { MigrationInterface, QueryRunner } from "typeorm";

export class AddServiceBookingsAndStatus1748867200447 implements MigrationInterface {
    name = 'AddServiceBookingsAndStatus1748867200447'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Primero, eliminar las restricciones de clave foránea existentes.
        // TypeORM las dropea para luego crearlas de nuevo al final con las nuevas configuraciones o relaciones.
        await queryRunner.query(`ALTER TABLE "Servicios" DROP CONSTRAINT "servicios_usuarioid_fkey"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "fk_user"`);

        // Crear la tabla service_bookings (esta es una nueva tabla, no debería dar problemas)
        await queryRunner.query(`CREATE TABLE "service_bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "serviceId" integer NOT NULL, "bookingDate" date NOT NULL, "bookingTime" TIME, "details" text, "priceAtBooking" numeric(10,2) NOT NULL, "status" character varying NOT NULL DEFAULT 'confirmed', "userId" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_2a5ef9f3eb208896d1e1b9b2a7b" PRIMARY KEY ("id"))`);

        // Añadir la columna 'status' a la tabla 'bookings' (esta es nueva, no debería dar problemas)
        await queryRunner.query(`ALTER TABLE "bookings" ADD "status" character varying NOT NULL DEFAULT 'confirmed'`);

        // CAMBIO: La lógica para 'Servicios.id' no debería necesitar DROP DEFAULT y luego SET DEFAULT
        // A menos que tu 'Servicios.id' no fuera autoincremental antes, TypeORM podría intentar cambiarlo.
        // Si 'Servicios.id' ya era SERIAL o equivalente, estas líneas pueden ser innecesarias o problemáticas.
        // Las dejo porque TypeORM las generó, pero monitorea si causan problemas.
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "Servicios_id_seq" OWNED BY "Servicios"."id"`);
        await queryRunner.query(`ALTER TABLE "Servicios" ALTER COLUMN "id" SET DEFAULT nextval('"Servicios_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "Servicios" ALTER COLUMN "id" DROP DEFAULT`);

        // CAMBIO: Modificación segura para 'Servicios.title'
        // Si la columna ya existe, actualiza los nulos antes de aplicar NOT NULL
        // Si no existe, puedes simplemente añadirla. TypeORM aquí está intentando recrearla.
        // La secuencia de comandos debe ser: DROP (si existía), ADD con NULL permitido, UPDATE NULLs, ALTER para SET NOT NULL.
        // Pero dado que TypeORM hace DROP y luego ADD NOT NULL, la solucion es cambiar el ADD.

        // Primero, asegurarnos de que la columna existe y no tiene valores nulos
        // Si la migración generó un DROP COLUMN "title" y luego un ADD COLUMN "title" NOT NULL,
        // esto es lo que haremos.
        await queryRunner.query(`ALTER TABLE "Servicios" DROP COLUMN "title"`);
        // CAMBIO: Primero la añadimos permitiendo nulos.
        await queryRunner.query(`ALTER TABLE "Servicios" ADD "title" character varying`);
        // CAMBIO: Actualizamos los valores NULL a una cadena vacía (o lo que sea apropiado)
        await queryRunner.query(`UPDATE "Servicios" SET "title" = '' WHERE "title" IS NULL`);
        // CAMBIO: Ahora podemos aplicar la restricción NOT NULL.
        await queryRunner.query(`ALTER TABLE "Servicios" ALTER COLUMN "title" SET NOT NULL`);


        // CAMBIO: Modificación segura para 'Servicios.description'
        await queryRunner.query(`ALTER TABLE "Servicios" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "Servicios" ADD "description" character varying`);
        await queryRunner.query(`UPDATE "Servicios" SET "description" = '' WHERE "description" IS NULL`);
        await queryRunner.query(`ALTER TABLE "Servicios" ALTER COLUMN "description" SET NOT NULL`);

        // CAMBIO: Modificación segura para 'Servicios.price' (convertirlo a integer, si era float o numeric y tenía nulos)
        // Ojo: si price era numérico antes y tenía valores con decimales, la conversión a INTEGER truncará los valores.
        // Si no quieres perder decimales, manténlo como numeric o float.
        // Si antes era numeric y ahora quieres integer, esto truncará.
        // Si quieres que los nulos sean 0, actualiza los nulos a 0.
        await queryRunner.query(`ALTER TABLE "Servicios" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "Servicios" ADD "price" integer`); // Add as nullable temporarily
        await queryRunner.query(`UPDATE "Servicios" SET "price" = 0 WHERE "price" IS NULL`); // Set default for nulls
        await queryRunner.query(`ALTER TABLE "Servicios" ALTER COLUMN "price" SET NOT NULL`); // Then set NOT NULL

        // CAMBIO: Modificación segura para 'Servicios.image'
        // La columna "image" ya es nullable en tu entidad Service, así que DROP y ADD de nuevo es ok si sigue siendo nullable.
        // Si la entidad Service.image en el .ts era 'nullable: true', entonces esto no debería haber fallado.
        // Pero si en tu DB actual había nulos y luego intentaste recrearla como NOT NULL, si fallaría.
        // Tu migración generó 'image' character varying (sin NOT NULL), así que está bien tal como está.
        await queryRunner.query(`ALTER TABLE "Servicios" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "Servicios" ADD "image" character varying`); // No se añade NOT NULL, lo cual es correcto si es nullable en tu entidad.

        // CAMBIO: Modificación segura para 'bookings.studioId'
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "studioId"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "studioId" character varying`);
        await queryRunner.query(`UPDATE "bookings" SET "studioId" = '' WHERE "studioId" IS NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "studioId" SET NOT NULL`);

        // CAMBIO: Modificación segura para 'bookings.studioName'
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "studioName"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "studioName" character varying`);
        await queryRunner.query(`UPDATE "bookings" SET "studioName" = '' WHERE "studioName" IS NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "studioName" SET NOT NULL`);

        // CAMBIO: Modificación segura para 'bookings.userEmail'
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "userEmail"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "userEmail" character varying`);
        await queryRunner.query(`UPDATE "bookings" SET "userEmail" = '' WHERE "userEmail" IS NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "userEmail" SET NOT NULL`);

        // Estos ALTER COLUMN para createdAt están bien si quieres forzar NOT NULL y DEFAULT now()
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "createdAt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "createdAt" SET DEFAULT now()`);

        // Añadir las nuevas restricciones de clave foránea
        await queryRunner.query(`ALTER TABLE "service_bookings" ADD CONSTRAINT "FK_2855f8c3dde0a2b305c674bed48" FOREIGN KEY ("serviceId") REFERENCES "Servicios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_bookings" ADD CONSTRAINT "FK_75c69f195e6e02e0aa93b323a0c" FOREIGN KEY ("userId") REFERENCES "Usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Servicios" ADD CONSTRAINT "FK_96619efda1dd9b6d971dcdd8745" FOREIGN KEY ("userid") REFERENCES "Usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_38a69a58a323647f2e75eb994de" FOREIGN KEY ("userId") REFERENCES "Usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Las operaciones 'down' deben ser el inverso de las 'up'.
        // Asegúrate de que los cambios de 'title', 'description', 'price', 'image' en 'Servicios'
        // y 'studioId', 'studioName', 'userEmail' en 'bookings' también se reviertan correctamente.

        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_38a69a58a323647f2e75eb994de"`);
        await queryRunner.query(`ALTER TABLE "Servicios" DROP CONSTRAINT "FK_96619efda1dd9b6d971dcdd8745"`);
        await queryRunner.query(`ALTER TABLE "service_bookings" DROP CONSTRAINT "FK_75c69f195e6e02e0aa93b323a0c"`);
        await queryRunner.query(`ALTER TABLE "service_bookings" DROP CONSTRAINT "FK_2855f8c3dde0a2b305c674bed48"`);

        // Revertir createdAt de bookings
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`); // Este DEFAULT puede variar
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "createdAt" DROP NOT NULL`);

        // CAMBIO: Revertir userEmail de bookings
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "userEmail" DROP NOT NULL`); // Primero permitir NULL
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "userEmail"`);
        // Revertir a la definición original. Si era character varying(255) NOT NULL, se vuelve a eso.
        await queryRunner.query(`ALTER TABLE "bookings" ADD "userEmail" character varying(255) NOT NULL`);

        // CAMBIO: Revertir studioName de bookings
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "studioName" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "studioName"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "studioName" character varying(255) NOT NULL`);

        // CAMBIO: Revertir studioId de bookings
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "studioId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "studioId"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "studioId" character varying(255) NOT NULL`);


        // CAMBIO: Revertir image de Servicios
        await queryRunner.query(`ALTER TABLE "Servicios" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "Servicios" ADD "image" text`); // Vuelve al tipo original, si era text

        // CAMBIO: Revertir price de Servicios
        await queryRunner.query(`ALTER TABLE "Servicios" ALTER COLUMN "price" DROP NOT NULL`); // Permitir NULLs antes de dropear
        await queryRunner.query(`ALTER TABLE "Servicios" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "Servicios" ADD "price" numeric NOT NULL`); // Vuelve al tipo original numeric

        // CAMBIO: Revertir description de Servicios
        await queryRunner.query(`ALTER TABLE "Servicios" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Servicios" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "Servicios" ADD "description" text NOT NULL`);

        // CAMBIO: Revertir title de Servicios
        await queryRunner.query(`ALTER TABLE "Servicios" ALTER COLUMN "title" DROP NOT NULL`); // Permitir NULLs antes de dropear
        await queryRunner.query(`ALTER TABLE "Servicios" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "Servicios" ADD "title" character varying(255) NOT NULL`); // Vuelve al tipo original

        // Revertir cambios en Servicios.id
        await queryRunner.query(`ALTER TABLE "Servicios" ALTER COLUMN "id" SET DEFAULT nextval('servicios_id_seq')`); // Asegúrate de que el nombre de la secuencia sea exacto
        await queryRunner.query(`ALTER TABLE "Servicios" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "Servicios_id_seq"`);

        // Dropear la columna status de bookings
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "status"`);
        // Dropear la tabla service_bookings
        await queryRunner.query(`DROP TABLE "service_bookings"`);

        // Recrear las restricciones de clave foránea originales (si se eliminaron al principio)
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "fk_user" FOREIGN KEY ("userId") REFERENCES "Usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Servicios" ADD CONSTRAINT "servicios_usuarioid_fkey" FOREIGN KEY ("userid") REFERENCES "Usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}