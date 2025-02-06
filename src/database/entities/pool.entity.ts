import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Pool {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  liquidity: string;

  @Column()
  sqrtPrice: string;

  @Column({ nullable: true })
  tick: string;

  @Column()
  feeTier: string;

  @Column()
  token0: string;

  @Column()
  token1: string;
}
