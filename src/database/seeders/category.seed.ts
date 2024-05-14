import { DataSource } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { Category } from 'src/entities/category.entity';
import { categories } from 'src/master-data/category';

export default class CategorySeeder implements Seeder {
  public async run(factory: Factory, dataSource: DataSource) {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.clear(Category);
      await queryRunner.manager.save(Category, categories);
      await queryRunner.commitTransaction();
      console.log('\nSeed category data successfully');
    } catch (e) {
      console.log('\nFailed to seed category data', e);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
