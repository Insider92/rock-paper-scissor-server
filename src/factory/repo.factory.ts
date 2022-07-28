import { MockType } from 'src/helper/mockType';
import { Repository } from 'typeorm';

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({
    findOne: jest.fn((entity) => entity),
    save: jest.fn((entity) => entity),
    create: jest.fn((entity) => entity),
  }),
);
