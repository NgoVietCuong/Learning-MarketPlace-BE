import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterLessonsTableAddDurationColumn1717144015940 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'lessons',
      new TableColumn({
        name: 'duration',
        type: 'int',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('lessons', 'duration');
  }
}
