import { DataSource } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { Role } from 'src/entities/role.entity';
import { roles } from 'src/master-data/role';

export default class RoleSeeder implements Seeder {
  public async run(factory: Factory, dataSource: DataSource) {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.clear(Role);
      await queryRunner.manager.save(Role, roles);
      await queryRunner.commitTransaction();
      console.log('\nSeed role data successfully');
    } catch (e) {
      console.log('\nFailed to seed role data', e);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
