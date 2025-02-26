import { InMemoryMessageRepository } from "../InMemoryMemoryMessageRepository";
import { Message } from "../Message";
import {
  DateProvider,
  EmptyMessageError,
  MessageTooLongError,
  PostMessageCommand,
  PostMessageUseCase,
} from "../post-message.usecase";
import { StubDateProvider } from "../StubDateProvider";

describe("Feature : Posting a message", () => {
  let fixture: Fixture;

  beforeEach(() => {
    fixture = createFixture();
  });

  describe("Rule : A message can contain a maximun of 280 characters", () => {
    test("Alice can post a message on her timeline", async () => {
      fixture.givenNowIs(new Date("2025-02-23T19:00:00.000Z"));

      await fixture.whenUserPostAmessage({
        id: "message-id",
        text: "Hello World",
        author: "Alice",
      });

      fixture.thenPostedMessageShouldBe({
        id: "message-id",
        text: "Hello World",
        author: "Alice",
        publishedAt: new Date("2025-02-23T19:00:00.000Z"),
      });
    });

    test("Alice cannot post a message with more than 280 characters", async () => {
      const textWith281Char =
        "Twitter naît en 2006, créé par Jack Dorsey, Noah Glass, Biz Stone et Evan Williams. Projet interne d’Odeo, il devient une plateforme publique. Les tweets, limités à 140 caractères, révolutionnent la communication en ligne par leur rapidité et simplicité, marquant une nouvelle ère numérique.";
      fixture.givenNowIs(new Date("2025-02-23T19:00:00.000Z"));

      await fixture.whenUserPostAmessage({
        id: "message-id",
        author: "Alice",
        text: textWith281Char,
      });

      fixture.thenErrorShouldbe(MessageTooLongError);
    });
  });

  describe("Rule : A message cannot be empty", () => {
    test("Alice cannot post an empty message", async () => {
      fixture.givenNowIs(new Date("2025-02-23T19:00:00.000Z"));

      await fixture.whenUserPostAmessage({
        id: "message-id",
        author: "Alice",
        text: "",
      });

      fixture.thenErrorShouldbe(EmptyMessageError);
    });

    test("Alice cannot post a message with only whitespaces", async () => {
      fixture.givenNowIs(new Date("2025-02-23T19:00:00.000Z"));

      await fixture.whenUserPostAmessage({
        id: "message-id",
        author: "Alice",
        text: "      ",
      });

      fixture.thenErrorShouldbe(EmptyMessageError);
    });
  });
});

function createFixture() {
  const dateProvider = new StubDateProvider();
  const messageRepository = new InMemoryMessageRepository();
  const postMessageUseCase = new PostMessageUseCase(
    messageRepository,
    dateProvider
  );
  let thrownError: Error;

  return {
    givenNowIs(now: Date) {
      dateProvider.now = now;
    },
    async whenUserPostAmessage(postMessageCommand: PostMessageCommand) {
      try {
        await postMessageUseCase.handle(postMessageCommand);
      } catch (err) {
        thrownError = err;
      }
    },
    thenPostedMessageShouldBe(expectedMessage: Message) {
      expect(expectedMessage).toEqual(
        messageRepository.getMessageById(expectedMessage.id)
      );
    },
    thenErrorShouldbe(expectedErrorClass: new () => Error) {
      expect(thrownError).toBeInstanceOf(expectedErrorClass);
    },
  };
}

type Fixture = ReturnType<typeof createFixture>;
