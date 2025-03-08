import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaMessageRepository } from '../PrismaMessageRepository';
import { messageBuilder } from '../../tests/MessageBuilder';

const asyncExec = promisify(exec);

describe('PrismaMessageRepository', () => {
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaClient;

  beforeAll(async () => {
    container = await new PostgreSqlContainer()
      .withDatabase('crafty-test')
      .withUsername('crafty-test')
      .withPassword('crafty-test')
      .withExposedPorts(5432)
      .start();
    const databaseUrl = container.getConnectionUri();

    prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

    await asyncExec(`DATABASE_URL=${databaseUrl} npx prisma migrate deploy`);

    return prismaClient.$connect();
  });

  afterAll(async () => {
    await container.stop({ timeout: 1000 });
    return prismaClient.$disconnect();
  });

  beforeEach(async () => {
    await prismaClient.message.deleteMany();
    await prismaClient.$executeRawUnsafe('DELETE FROM "User" CASCADE');
  });

  test('save() should save a message', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    await messageRepository.save(
      messageBuilder()
        .withAuthor('Alice')
        .withId('id1')
        .withText('Hello World !')
        .publishedAt(new Date('2025-03-07T11:00:00.000Z'))
        .build(),
    );

    const expectedMessage = await prismaClient.message.findUnique({
      where: {
        id: 'id1',
      },
    });

    expect(expectedMessage).toEqual({
      id: 'id1',
      authorId: 'Alice',
      text: 'Hello World !',
      publishedAt: new Date('2025-03-07T11:00:00.000Z'),
    });
  });

  test('save() should update an existing message', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);
    const aliceMessageBuilder = messageBuilder()
      .withAuthor('Alice')
      .withId('id1')
      .withText('Hello World !')
      .publishedAt(new Date('2025-03-07T11:00:00.000Z'));

    await messageRepository.save(aliceMessageBuilder.build());

    await messageRepository.save(
      aliceMessageBuilder.withText('Hello World 2 !').build(),
    );

    const expectedMessage = await prismaClient.message.findUnique({
      where: {
        id: 'id1',
      },
    });

    expect(expectedMessage).toEqual({
      id: 'id1',
      authorId: 'Alice',
      text: 'Hello World 2 !',
      publishedAt: new Date('2025-03-07T11:00:00.000Z'),
    });
  });

  test('getById() should return a message by using its id', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);
    const aliceMessage = messageBuilder()
      .withAuthor('Alice')
      .withId('id1')
      .withText('Hello World !')
      .publishedAt(new Date('2025-03-07T11:00:00.000Z'))
      .build();
    await messageRepository.save(aliceMessage);

    const retrievedMessage = await messageRepository.getById('id1');

    expect(retrievedMessage).toEqual(aliceMessage);
  });

  test('getMessagesByUser() should all messages of the specified user', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);
    await Promise.all([
      messageRepository.save(
        messageBuilder()
          .withAuthor('Alice')
          .withId('id1')
          .withText('Hello World !')
          .publishedAt(new Date('2025-03-07T11:00:00.000Z'))
          .build(),
      ),
      messageRepository.save(
        messageBuilder()
          .withAuthor('Bob')
          .withId('id2')
          .withText('Hello World !')
          .publishedAt(new Date('2025-03-07T11:01:00.000Z'))
          .build(),
      ),
      messageRepository.save(
        messageBuilder()
          .withAuthor('Alice')
          .withId('id3')
          .withText('Hello World ! Again')
          .publishedAt(new Date('2025-03-07T11:02:00.000Z'))
          .build(),
      ),
    ]);

    const aliceMessage = await messageRepository.getMessagesByUser('Alice');

    expect(aliceMessage).toHaveLength(2);
    expect(aliceMessage).toEqual(
      expect.arrayContaining([
        messageBuilder()
          .withAuthor('Alice')
          .withId('id1')
          .withText('Hello World !')
          .publishedAt(new Date('2025-03-07T11:00:00.000Z'))
          .build(),
        messageBuilder()
          .withAuthor('Alice')
          .withId('id3')
          .withText('Hello World ! Again')
          .publishedAt(new Date('2025-03-07T11:02:00.000Z'))
          .build(),
      ]),
    );
  });
});
