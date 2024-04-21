import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateInstructorProfilesTable1713626719796 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'instructor_profiles',
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
            isNullable: true,
          },
          {
            name: 'slug',
            type: 'varchar(100)',
            isNullable: true,
          },
          {
            name: 'display_name',
            type: 'varchar(100)',
            isNullable: true,
          },
          {
            name: 'picture',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'introduction',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'biography',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'twitter_link',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'linkedin_link',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'youtube_link',
            type: 'varchar',
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
    await queryRunner.dropTable('instructor_profiles', true);
  }
}
