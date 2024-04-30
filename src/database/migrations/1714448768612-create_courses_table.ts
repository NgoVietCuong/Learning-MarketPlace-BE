import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateCoursesTable1714448768612 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'courses',
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
            name: 'instructor_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'title',
            type: 'varchar(100)',
            isNullable: true,
          },
          {
            name: 'slug',
            type: 'varchar(100)',
            isNullable: true,
          },

          {
            name: 'level',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'image_preview',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'video_preview',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'overview',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'is_published',
            type: 'boolean',
            default: true,
            isNullable: true,
          },
          {
            name: 'price',
            type: 'float',
            isNullable: true,
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
    await queryRunner.dropTable('courses', true);
  }
}
