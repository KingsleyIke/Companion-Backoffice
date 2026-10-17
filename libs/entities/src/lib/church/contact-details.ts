import { Column } from 'typeorm';

// Embedded with { prefix: false }, so the columns stay website, email and phone on each table.
export class ContactDetails {
  @Column({ type: 'varchar', length: 255, nullable: true })
  website!: string | null;

  @Column({ type: 'varchar', length: 254, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phone!: string | null;
}
