import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateSectionsTable1715399023947 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
              name: 'sections',
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
                  name: 'course_id',
                  type: 'int',
                  isNullable: true,
                },
                {
                  name: 'title',
                  type: 'varchar(100)',
                  isNullable: true,
                },
                {
                  name: 'sort_order',
                  type: 'smallint',
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
        await queryRunner.dropTable('sections', true);
    }

}
