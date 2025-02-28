import { createMessageFixture, MessagingFixture } from "./createMessageFixture";
import { messageBuilder } from "./MessageBuilder";

describe("Feature : Editing a message", () => {
  let fixture: MessagingFixture;

  beforeEach(() => {
    fixture = createMessageFixture();
  });

  describe("Rule : The edited text should not be superior to 200 characters", () => {
    test("Alice can edit her mesage to a text inferior to 200 characters", () => {
      const aliceMessageBuilder = messageBuilder()
        .withId("message-id")
        .withAuthor("Alice")
        .withText("Hello Wrold");

      fixture.givenTheFollowingMessageExist([aliceMessageBuilder.build()]);

      fixture.whenUserEditMessage({
        messageId: "message-id",
        text: "Hello World",
      });

      fixture.thenMessageShouldBe(
        aliceMessageBuilder.withText("Hello World").build()
      );
    });
  });
});
