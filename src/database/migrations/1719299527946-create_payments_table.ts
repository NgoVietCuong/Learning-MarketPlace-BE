import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePaymentsTable1719299527946 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isUnique: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'int',
          },
          {
            name: 'course_id',
            type: 'int',
          },
          {
            name: 'paypal_order_id',
            type: 'varchar(100)'
          },
          {
            name: 'payee',
            type: 'varchar(100)'
          },
          {
            name: 'status',
            type: 'varchar(100)',
          },
          {
            name: 'amount',
            type: 'float',
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('payments', true);
  }
}
