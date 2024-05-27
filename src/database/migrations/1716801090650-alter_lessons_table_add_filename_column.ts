import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterLessonsTableAddFilenameColumn1716801090650 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'lessons',
      new TableColumn({
        name: 'file_name',
        type: 'varchar(100)',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('lessons', 'file_name');
  }
}
