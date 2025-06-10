import { MigrationInterface, QueryRunner } from "typeorm";

export class AddServiceTypeToServices1749560593011 implements MigrationInterface {
    name = 'AddServiceTypeToServices1749560593011'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Servicios" ADD "serviceType" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Servicios" DROP COLUMN "serviceType"`);
    }

}
