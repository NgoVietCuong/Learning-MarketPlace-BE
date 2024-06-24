import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterInstructorTableAddPaypalEmailColumn1719245470218 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'instructor_profiles',
      new TableColumn({
        name: 'paypal_email',
        type: 'varchar(100)',
        isNullable: true,
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('instructor_profiles', 'paypal_email')
  }
}
