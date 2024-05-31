import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateLessonProgressTable1715873444525 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'lesson_progress',
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
            name: 'enrollment_id',
            type: 'int',
          },
          {
            name: 'lesson_id',
            type: 'int',
          },
          {
            name: 'is_completed',
            type: 'boolean',
            default: false,
          },
          {
            name: 'content_progress',
            type: 'int',
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
    await queryRunner.dropTable('lesson_progress', true);
  }
}
