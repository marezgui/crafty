import { InMemoryMessageRepository } from "../InMemoryMemoryMessageRepository";
import { Message } from "../Message";
import { StubDateProvider } from "../StubDateProvider";
import { ViewTimelineUseCase } from "../ViewTimelineUseCase";

describe("Feature: Viewing a personal timeline", () => {
  let fixture: Fixture;

  beforeEach(() => {
    fixture = createFixture();
  });

  describe("Rule: Messages are shown in DESC order", () => {
    test("Alice can view the 3 messages she published in her timeline", async () => {
      fixture.givenTheFollowingMessageExist([
        {
          id: "message-1",
          author: "Alice",
          text: "My first message",
          publishedAt: new Date("2025-02-25T04:00:00.000Z"),
        },
        {
          id: "message-2",
          author: "Bob",
          text: "Hi, it's Bob",
          publishedAt: new Date("2025-02-25T04:10:00.000Z"),
        },
        {
          id: "message-3",
          author: "Alice",
          text: "How are you all ?",
          publishedAt: new Date("2025-02-25T04:11:00.000Z"),
        },
        {
          id: "message-4",
          author: "Alice",
          text: "My last message",
          publishedAt: new Date("2025-02-25T04:11:30.000Z"),
        },
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

const createFixture = () => {
  let timeline: {
    author: string;
    text: string;
    publicationTime: string;
  }[];
  const messageRepository = new InMemoryMessageRepository();
  const dateProvider = new StubDateProvider();
  const viewTimelineUseCase = new ViewTimelineUseCase(
    messageRepository,
    dateProvider
  );

  return {
    givenTheFollowingMessageExist(messages: Message[]) {
      messageRepository.givenExistingMessages(messages);
    },
    givenNowIs(now: Date) {
      dateProvider.now = now;
    },
    async whenUserSeesTheTimelineOfAlice(user: string) {
      timeline = await viewTimelineUseCase.handle({ user });
    },
    thenUserShouldSee(
      expectedTimeline: {
        author: string;
        text: string;
        publicationTime: string;
      }[]
    ) {
      expect(timeline).toEqual(expectedTimeline);
    },
  };
};

type Fixture = ReturnType<typeof createFixture>;
