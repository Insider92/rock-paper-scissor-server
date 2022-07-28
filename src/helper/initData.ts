import { Logger } from 'nestjs-pino';
import { ChoiceEntity } from 'src/module/choice/entity/choice.entity';
import { EntityManager } from 'typeorm';

export class initChoices {
  constructor(private readonly logger: Logger) {}
  public async up(entityManager: EntityManager): Promise<void> {
    const count = await entityManager.query(
      'SELECT COUNT(*) AS COUNT FROM choice;',
    );

    // there are already init choices
    if (count[0].COUNT > 0) {
      return;
    }

    this.logger.log('Creating init choices');
    // Disable forgein key check
    await entityManager.query('SET foreign_key_checks = 0');

    // Create choices
    await entityManager.save(
      entityManager.create<ChoiceEntity>(ChoiceEntity, {
        id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d',
        name: 'Rock',
        getsBeatenBy: [
          { id: '508c501e-8632-4aff-8d26-f20a85868e0b' },
          { id: '754f712b-0e1a-437c-8472-52952cf910a9' },
        ],
      }),
    );
    await entityManager.save(
      entityManager.create<ChoiceEntity>(ChoiceEntity, {
        id: '508c501e-8632-4aff-8d26-f20a85868e0b',
        name: 'Paper',
        getsBeatenBy: [
          { id: '7d8a0086-a754-4b82-9c8d-0ffc90c74544' },
          { id: '2f482bd8-648c-49aa-8233-c12c1b07036a' },
        ],
      }),
    );
    await entityManager.save(
      entityManager.create<ChoiceEntity>(ChoiceEntity, {
        id: '7d8a0086-a754-4b82-9c8d-0ffc90c74544',
        name: 'Sisscor',
        getsBeatenBy: [
          { id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d' },
          { id: '754f712b-0e1a-437c-8472-52952cf910a9' },
        ],
      }),
    );
    await entityManager.save(
      entityManager.create<ChoiceEntity>(ChoiceEntity, {
        id: '2f482bd8-648c-49aa-8233-c12c1b07036a',
        name: 'Lizard',
        getsBeatenBy: [
          { id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d' },
          { id: '7d8a0086-a754-4b82-9c8d-0ffc90c74544' },
        ],
      }),
    );
    await entityManager.save(
      entityManager.create<ChoiceEntity>(ChoiceEntity, {
        id: '754f712b-0e1a-437c-8472-52952cf910a9',
        name: 'Spook',
        getsBeatenBy: [
          { id: '508c501e-8632-4aff-8d26-f20a85868e0b' },
          { id: '2f482bd8-648c-49aa-8233-c12c1b07036a' },
        ],
      }),
    );

    // Enable forgein key check
    await entityManager.query('SET foreign_key_checks = 1');
    this.logger.log('Done creating init choices');
  }
}
