import { MigrationInterface, QueryRunner } from "typeorm";

export class Tick1738849942021 implements MigrationInterface {
    name = 'Tick1738849942021'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tick" ("id" SERIAL NOT NULL, "tickIdx" character varying NOT NULL, "poolAddress" character varying NOT NULL, "liquidityGross" character varying, "liquidityNet" character varying NOT NULL, "createdAtTimestamp" character varying NOT NULL, CONSTRAINT "PK_d7e871478c4b671b0c6f1359850" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tick"`);
    }

}
