import {
  createMessagingFixture,
  MessagingFixture,
} from "./createMessageFixture";
import { messageBuilder } from "./MessageBuilder";

describe("Feature: Viewing a personal timeline", () => {
  let fixture: MessagingFixture;

  beforeEach(() => {
    fixture = createMessagingFixture();
  });

  describe("Rule: Messages are shown in DESC order", () => {
    test("Alice can view the 3 messages she published in her timeline", async () => {
      const aliceMessageBuilder = messageBuilder().withAuthor("Alice");

      fixture.givenTheFollowingMessageExist([
        aliceMessageBuilder
          .withId("message-1")
          .withText("My first message")
          .publishedAt(new Date("2025-02-25T03:59:59.000Z"))
          .build(),
        messageBuilder()
          .withAuthor("Bob")
          .withId("message-2")
          .withText("My first message")
          .publishedAt(new Date("2025-02-25T04:10:00.000Z"))
          .build(),
        aliceMessageBuilder
          .withId("message-3")
          .withText("How are you all ?")
          .publishedAt(new Date("2025-02-25T04:11:00.000Z"))
          .build(),
        aliceMessageBuilder
          .withId("message-4")
          .withText("My last message")
          .publishedAt(new Date("2025-02-25T04:11:30.000Z"))
          .build(),
      ]);

      fixture.givenNowIs(new Date("2025-02-25T04:12:00.000Z"));

      await fixture.whenUserSeesTheTimelineOfAlice("Alice");

      fixture.thenUserShouldSee([
        {
          author: "Alice",
          text: "My last message",
          publicationTime: "less than a minute ago",
        },
        {
          author: "Alice",
          text: "How are you all ?",
          publicationTime: "1 minute ago",
        },
        {
          author: "Alice",
          text: "My first message",
          publicationTime: "12 minutes ago",
        },
      ]);
    });
  });
});
