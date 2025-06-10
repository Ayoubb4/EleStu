import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1749561468639 implements MigrationInterface {
    name = 'InitialSchema1749561468639'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Servicios" ADD "serviceType" character varying`);
        await queryRunner.query(`ALTER TABLE "Servicios" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "Servicios" ADD "price" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Servicios" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "Servicios" ADD "image" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Servicios" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "Servicios" ADD "image" character varying`);
        await queryRunner.query(`ALTER TABLE "Servicios" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "Servicios" ADD "price" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Servicios" DROP COLUMN "serviceType"`);
    }

}
