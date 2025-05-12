import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateService1746692502931 implements MigrationInterface {
    name = 'CreateService1746692502931'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "service" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "price" integer NOT NULL, "userId" integer, CONSTRAINT "PK_85a21558c006647cd76fdce044b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "service" ADD CONSTRAINT "FK_2d00a20ab5abb3fcbf4c15cabc7" FOREIGN KEY ("userId") REFERENCES "Usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service" DROP CONSTRAINT "FK_2d00a20ab5abb3fcbf4c15cabc7"`);
        await queryRunner.query(`DROP TABLE "service"`);
    }

}
