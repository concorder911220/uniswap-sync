import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Tick {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tickIdx: string;

  @Column()
  poolAddress: string;

  @Column({ nullable: true })
  liquidityGross: string;

  @Column()
  liquidityNet: string;

  @Column()
  createdAtTimestamp: string;
}
