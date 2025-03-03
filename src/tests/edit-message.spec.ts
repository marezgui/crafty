import { EmptyMessageError, MessageTooLongError } from "../PostMessageUseCase";
import { createMessageFixture, MessagingFixture } from "./createMessageFixture";
import { messageBuilder } from "./MessageBuilder";

describe("Feature : Editing a message", () => {
  let fixture: MessagingFixture;

  beforeEach(() => {
    fixture = createMessageFixture();
  });

  describe("Rule : The edited text should not be superior to 200 characters", () => {
    test("Alice can edit her mesage to a text inferior to 200 characters", async () => {
      const aliceMessageBuilder = messageBuilder()
        .withId("message-id")
        .withAuthor("Alice")
        .withText("Hello Wrold");

      fixture.givenTheFollowingMessageExist([aliceMessageBuilder.build()]);

      await fixture.whenUserEditMessage({
        messageId: "message-id",
        text: "Hello World",
      });

      await fixture.thenMessageShouldBe(
        aliceMessageBuilder.withText("Hello World").build()
      );
    });

    test("Alice cannot edit her messages to a text superior to 200 characters", async () => {
      const textWith281Char =
        "Twitter naît en 2006, créé par Jack Dorsey, Noah Glass, Biz Stone et Evan Williams. Projet interne d’Odeo, il devient une plateforme publique. Les tweets, limités à 140 caractères, révolutionnent la communication en ligne par leur rapidité et simplicité, marquant une nouvelle ère numérique.";
      const originalAliceMessage = messageBuilder()
        .withId("message-id")
        .withAuthor("Alice")
        .withText("Hello World")
        .build();

      fixture.givenTheFollowingMessageExist([originalAliceMessage]);

      fixture.whenUserEditMessage({
        messageId: "message-id",
        text: textWith281Char,
      });

      await fixture.thenMessageShouldBe(originalAliceMessage);
      fixture.thenErrorShouldbe(MessageTooLongError);
    });

    test("Alice cannot her message to an empty text", async () => {
      const originalAliceMessage = messageBuilder()
        .withId("message-id")
        .withAuthor("Alice")
        .withText("Hello World")
        .build();

      fixture.givenTheFollowingMessageExist([originalAliceMessage]);

      await fixture.whenUserEditMessage({
        messageId: "message-id",
        text: "",
      });

      await fixture.thenMessageShouldBe(originalAliceMessage);
      fixture.thenErrorShouldbe(EmptyMessageError);
    });

    test("Alice cannot her message to an empty spaces text", async () => {
      const originalAliceMessage = messageBuilder()
        .withId("message-id")
        .withAuthor("Alice")
        .withText("Hello World")
        .build();

      fixture.givenTheFollowingMessageExist([originalAliceMessage]);

      await fixture.whenUserEditMessage({
        messageId: "message-id",
        text: "   ",
      });

      await fixture.thenMessageShouldBe(originalAliceMessage);
      fixture.thenErrorShouldbe(EmptyMessageError);
    });
  });
});
