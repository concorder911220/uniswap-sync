import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1738817160203 implements MigrationInterface {
    name = 'Init1738817160203'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "pool_temp" ("id" SERIAL NOT NULL, "liquidity" character varying NOT NULL, "sqrtPrice" character varying NOT NULL, "tick" character varying, "feeTier" character varying NOT NULL, "token0" character varying NOT NULL, "token1" character varying NOT NULL, CONSTRAINT "PK_341619acd2ab99672068319d66a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pool" ("id" SERIAL NOT NULL, "liquidity" character varying NOT NULL, "sqrtPrice" character varying NOT NULL, "tick" character varying, "feeTier" character varying NOT NULL, "token0" character varying NOT NULL, "token1" character varying NOT NULL, CONSTRAINT "PK_db1bfe411e1516c01120b85f8fe" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "pool"`);
        await queryRunner.query(`DROP TABLE "pool_temp"`);
    }

}
