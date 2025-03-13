import { TestingModule } from '@nestjs/testing';
import { CommandTestFactory } from 'nest-commander-testing';
import { DateProvider } from '@crafty/crafty/application/DateProvider';
import { PrismaMessageRepository } from '@crafty/crafty/infra/PrismaMessageRepository';
import { StubDateProvider } from '@crafty/crafty/infra/StubDateProvider';
import { PrismaClient } from '@prisma/client';
import {
  StartedPostgreSqlContainer,
  PostgreSqlContainer,
} from '@testcontainers/postgresql';
import { exec } from 'child_process';
import { promisify } from 'util';
import { CliModule } from '../src/cli.module';
import { messageBuilder } from '@crafty/crafty/tests/MessageBuilder';

jest.setTimeout(10000);

const asyncExec = promisify(exec);

describe('Cli App (e2e)', () => {
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaClient;
  let commandInstance: TestingModule;
  const now = new Date('2023-02-14T19:00:00.000Z');
  const dateProvider = new StubDateProvider();
  dateProvider.now = now;

  beforeAll(async () => {
    container = await new PostgreSqlContainer()
      .withDatabase('crafty')
      .withUsername('crafty')
      .withPassword('crafty')
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

  beforeEach(async () => {
    jest.spyOn(process, 'exit').mockImplementation(() => {
      return undefined as never;
    });
    commandInstance = await CommandTestFactory.createTestingCommand({
      imports: [CliModule],
    })
      .overrideProvider(DateProvider)
      .useValue(dateProvider)
      .overrideProvider(PrismaClient)
      .useValue(prismaClient)
      .compile();
    await prismaClient.message.deleteMany();
    await prismaClient.$executeRawUnsafe('DELETE FROM "User" CASCADE');
  });

  afterAll(async () => {
    await container.stop({ timeout: 1000 });
    return prismaClient.$disconnect();
  });

  test('post command', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    await CommandTestFactory.run(commandInstance, [
      'post',
      'Alice',
      'Message from test',
    ]);

    const aliceMessages = await messageRepository.getMessagesByUser('Alice');
    expect(aliceMessages[0].data).toEqual({
      id: expect.any(String) as string,
      author: 'Alice',
      text: 'Message from test',
      publishedAt: now,
    });
  });

  test('edit command', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    await messageRepository.save(
      messageBuilder()
        .withAuthor('Alice')
        .withId('alice-msg-to-edit-id')
        .publishedAt(now)
        .withText('hello world !')
        .build(),
    );

    await CommandTestFactory.run(commandInstance, [
      'edit',
      'alice-msg-to-edit-id',
      'Hey everyone !',
    ]);

    const editedMessage = await messageRepository.getById(
      'alice-msg-to-edit-id',
    );

    expect(editedMessage).toEqual(
      messageBuilder()
        .withAuthor('Alice')
        .withId('alice-msg-to-edit-id')
        .publishedAt(now)
        .withText('Hey everyone !')
        .build(),
    );
  });
});
