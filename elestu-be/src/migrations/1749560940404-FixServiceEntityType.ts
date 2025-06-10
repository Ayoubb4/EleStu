import { MigrationInterface, QueryRunner } from "typeorm";

export class FixServiceEntityType1749560940404 implements MigrationInterface {
    name = 'FixServiceEntityType1749560940404'

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
