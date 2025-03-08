import * as path from 'path';
import * as fs from 'fs';
import { messageBuilder } from '../../tests/MessageBuilder';
import { FileSystemMessageRepository } from '../FileSystemMessageRepository';

const testMessagePath = path.join(__dirname, './messages-test.json');

describe('FileSystemMessageRepository', () => {
  beforeEach(async () => {
    await fs.promises.writeFile(testMessagePath, JSON.stringify([]));
  });

  test('save() can save a message in the file system', async () => {
    const messageRepository = new FileSystemMessageRepository(testMessagePath);

    await messageRepository.save(
      messageBuilder()
        .withId('id1')
        .withAuthor('Alice')
        .withText('Test message')
        .publishedAt(new Date('2025-03-03T16:00:00.000Z'))
        .build(),
    );

    const messagesData = await fs.promises.readFile(testMessagePath);
    const messagesJSON = JSON.parse(messagesData.toString()) as Array<{
      id: string;
      author: string;
      text: string;
      publishedAt: string;
    }>;

    expect(messagesJSON).toEqual([
      {
        id: 'id1',
        author: 'Alice',
        text: 'Test message',
        publishedAt: '2025-03-03T16:00:00.000Z',
      },
    ]);
  });

  test('save() can update an existing message in the file system', async () => {
    const messageRepository = new FileSystemMessageRepository(testMessagePath);
    await fs.promises.writeFile(
      testMessagePath,
      JSON.stringify([
        {
          id: 'id1',
          author: 'Alice',
          text: 'Test message',
          publishedAt: '2025-03-03T16:00:00.000Z',
        },
      ]),
    );

    await messageRepository.save(
      messageBuilder()
        .withId('id1')
        .withAuthor('Alice')
        .withText('Test message edited')
        .publishedAt(new Date('2025-03-03T16:00:00.000Z'))
        .build(),
    );

    const messagesData = await fs.promises.readFile(testMessagePath);
    const messagesJSON = JSON.parse(messagesData.toString()) as Array<{
      id: string;
      author: string;
      text: string;
      publishedAt: string;
    }>;

    expect(messagesJSON).toEqual([
      {
        id: 'id1',
        author: 'Alice',
        text: 'Test message edited',
        publishedAt: '2025-03-03T16:00:00.000Z',
      },
    ]);
  });

  test('getById() return a message by id', async () => {
    const messageRepository = new FileSystemMessageRepository(testMessagePath);

    await fs.promises.writeFile(
      testMessagePath,
      JSON.stringify([
        {
          id: 'id1',
          author: 'Alice',
          text: 'Test message',
          publishedAt: '2025-03-03T16:00:00.000Z',
        },
        {
          id: 'id2',
          author: 'Bob',
          text: "Hello i'm Bob",
          publishedAt: '2025-03-03T16:00:00.000Z',
        },
      ]),
    );

    const bobMessage = await messageRepository.getById('id2');

    expect(bobMessage).toEqual(
      messageBuilder()
        .withId('id2')
        .withAuthor('Bob')
        .withText("Hello i'm Bob")
        .publishedAt(new Date('2025-03-03T16:00:00.000Z'))
        .build(),
    );
  });

  test('getMessagesByUser() return messages from specific user', async () => {
    const messageRepository = new FileSystemMessageRepository(testMessagePath);

    await fs.promises.writeFile(
      testMessagePath,
      JSON.stringify([
        {
          id: 'id1',
          author: 'Alice',
          text: 'Test message',
          publishedAt: '2025-03-03T16:00:00.000Z',
        },
        {
          id: 'id2',
          author: 'Bob',
          text: "Hello i'm Bob",
          publishedAt: '2025-03-03T16:10:00.000Z',
        },
        {
          id: 'id3',
          author: 'Alice',
          text: 'Second message from alice',
          publishedAt: '2025-03-03T16:50:00.000Z',
        },
      ]),
    );

    const aliceMessages = await messageRepository.getMessagesByUser('Alice');

    expect(aliceMessages).toHaveLength(2);

    expect(aliceMessages).toEqual(
      expect.arrayContaining([
        messageBuilder()
          .withId('id1')
          .withAuthor('Alice')
          .withText('Test message')
          .publishedAt(new Date('2025-03-03T16:00:00.000Z'))
          .build(),
        messageBuilder()
          .withId('id3')
          .withAuthor('Alice')
          .withText('Second message from alice')
          .publishedAt(new Date('2025-03-03T16:50:00.000Z'))
          .build(),
      ]),
    );
  });
});
