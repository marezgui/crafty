import {
  createFollowingFixture,
  FollowingFixture,
} from "./createFollowingFixture";
import {
  createMessagingFixture,
  MessagingFixture,
} from "./createMessageFixture";
import { createWallFixture, WallFixture } from "./createWallFixture";
import { messageBuilder } from "./MessageBuilder";

describe("Feature : Viewing user wall", () => {
  let fixture: WallFixture;
  let messagingFixture: MessagingFixture;
  let followingFixture: FollowingFixture;

  beforeEach(() => {
    messagingFixture = createMessagingFixture();
    followingFixture = createFollowingFixture();

    fixture = createWallFixture({
      messageRepository: messagingFixture.messageRepository,
      followeeRepository: followingFixture.followeeRepository,
    });
  });

  describe("Rule : All the messages from the user and her followees should appear in DESC order", () => {
    test("Charlie has subscribed to Alice's timeline and thus can view an aggregated list of all subscriptions", async () => {
      fixture.givenNowIs(new Date("2025-03-05T16:00:00.000Z"));

      messagingFixture.givenTheFollowingMessageExist([
        messageBuilder()
          .withId("id1")
          .withAuthor("Alice")
          .withText("I love the weather today")
          .publishedAt(new Date("2025-03-05T15:45:00.000Z"))
          .build(),
        messageBuilder()
          .withId("id2")
          .withAuthor("Bob")
          .withText("Damn! We lost")
          .publishedAt(new Date("2025-03-05T16:00:00.000Z"))
          .build(),
        messageBuilder()
          .withId("id3")
          .withAuthor("Charlie")
          .withText("I'm in New York today! Anyone wants to have a coffee?")
          .publishedAt(new Date("2025-03-05T16:00:00.000Z"))
          .build(),
      ]);

      followingFixture.givenUserFollowees({
        user: "Charlie",
        followees: ["Alice"],
      });

      await fixture.whenUserSeesTheWallOf("Charlie");

      fixture.thenUserShouldSee([
        {
          author: "Charlie",
          text: "I'm in New York today! Anyone wants to have a coffee?",
          publicationTime: "less than a minute ago",
        },
        {
          author: "Alice",
          text: "I love the weather today",
          publicationTime: "15 minutes ago",
        },
      ]);
    });
  });
});
