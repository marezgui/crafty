import { InMemoryMessageRepository } from "../InMemoryMemoryMessageRepository";
import {
  DateProvider,
  EmptyMessageError,
  Message,
  MessageTooLongError,
  PostMessageCommand,
  PostMessageUseCase,
} from "../post-message.usecase";

describe("Feature : Posting a message", () => {
  let fixture: Fixture;

  beforeEach(() => {
    fixture = createFixture();
  });

  describe("Rule : A message can contain a maximun of 280 characters", () => {
    test("Alice can post a message on her timeline", () => {
      fixture.giveNowIs(new Date("2025-02-23T19:00:00.000Z"));

      fixture.whenUserPostAmessage({
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

    test("Alice cannot post a message with more than 280 characters", () => {
      const textWith281Char =
        "Twitter naît en 2006, créé par Jack Dorsey, Noah Glass, Biz Stone et Evan Williams. Projet interne d’Odeo, il devient une plateforme publique. Les tweets, limités à 140 caractères, révolutionnent la communication en ligne par leur rapidité et simplicité, marquant une nouvelle ère numérique.";
      fixture.giveNowIs(new Date("2025-02-23T19:00:00.000Z"));

      fixture.whenUserPostAmessage({
        id: "message-id",
        author: "Alice",
        text: textWith281Char,
      });

      fixture.thenErrorShouldbe(MessageTooLongError);
    });
  });

  describe("Rule : A message cannot be empty", () => {
    test("Alice cannot post an empty message", () => {
      fixture.giveNowIs(new Date("2025-02-23T19:00:00.000Z"));

      fixture.whenUserPostAmessage({
        id: "message-id",
        author: "Alice",
        text: "",
      });

      fixture.thenErrorShouldbe(EmptyMessageError);
    });

    test("Alice cannot post a message with only whitespaces", () => {
      fixture.giveNowIs(new Date("2025-02-23T19:00:00.000Z"));

      fixture.whenUserPostAmessage({
        id: "message-id",
        author: "Alice",
        text: "      ",
      });

      fixture.thenErrorShouldbe(EmptyMessageError);
    });
  });
});

class StubDateProvider implements DateProvider {
  now: Date;
  getNow(): Date {
    return this.now;
  }
}

function createFixture() {
  const dateProvider = new StubDateProvider();
  const messageRepository = new InMemoryMessageRepository();
  const postMessageUseCase = new PostMessageUseCase(
    messageRepository,
    dateProvider
  );
  let thrownError: Error;

  return {
    giveNowIs(now: Date) {
      dateProvider.now = now;
    },
    whenUserPostAmessage(postMessageCommand: PostMessageCommand) {
      try {
        postMessageUseCase.handle(postMessageCommand);
      } catch (err) {
        thrownError = err;
      }
    },
    thenPostedMessageShouldBe(expectedMessage: Message) {
      expect(expectedMessage).toEqual(messageRepository.message);
    },
    thenErrorShouldbe(expectedErrorClass: new () => Error) {
      expect(thrownError).toBeInstanceOf(expectedErrorClass);
    },
  };
}

type Fixture = ReturnType<typeof createFixture>;
