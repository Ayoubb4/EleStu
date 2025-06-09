import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1749466674725 implements MigrationInterface {
    name = 'InitialSchema1749466674725'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "service_bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "serviceId" integer NOT NULL, "userId" integer, "userEmail" character varying NOT NULL, "serviceTitle" character varying NOT NULL, "date" date NOT NULL, "time" TIME, "description" text, "price" numeric(10,2) NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_2a5ef9f3eb208896d1e1b9b2a7b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Servicios" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "price" integer NOT NULL, "image" character varying, "userid" integer, CONSTRAINT "PK_5dc10ec4063251070db0499e74f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "studioId" character varying NOT NULL, "studioName" character varying NOT NULL, "date" date NOT NULL, "time" TIME NOT NULL, "description" text NOT NULL, "pricePerHour" numeric(10,2) NOT NULL, "userEmail" character varying NOT NULL, "userId" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Usuarios" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "lastName" character varying(100), "email" character varying(100) NOT NULL, "password" character varying(100) NOT NULL, "phoneNumber" character varying(20), CONSTRAINT "UQ_ca3e46c76538a31e48348447503" UNIQUE ("email"), CONSTRAINT "PK_6b4c9e5c7d35b294307b3fd0fea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "service_bookings" ADD CONSTRAINT "FK_2855f8c3dde0a2b305c674bed48" FOREIGN KEY ("serviceId") REFERENCES "Servicios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_bookings" ADD CONSTRAINT "FK_75c69f195e6e02e0aa93b323a0c" FOREIGN KEY ("userId") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Servicios" ADD CONSTRAINT "FK_96619efda1dd9b6d971dcdd8745" FOREIGN KEY ("userid") REFERENCES "Usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_38a69a58a323647f2e75eb994de" FOREIGN KEY ("userId") REFERENCES "Usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_38a69a58a323647f2e75eb994de"`);
        await queryRunner.query(`ALTER TABLE "Servicios" DROP CONSTRAINT "FK_96619efda1dd9b6d971dcdd8745"`);
        await queryRunner.query(`ALTER TABLE "service_bookings" DROP CONSTRAINT "FK_75c69f195e6e02e0aa93b323a0c"`);
        await queryRunner.query(`ALTER TABLE "service_bookings" DROP CONSTRAINT "FK_2855f8c3dde0a2b305c674bed48"`);
        await queryRunner.query(`DROP TABLE "Usuarios"`);
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`DROP TABLE "Servicios"`);
        await queryRunner.query(`DROP TABLE "service_bookings"`);
    }

}
