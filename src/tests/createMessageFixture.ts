import { InMemoryMessageRepository } from "../InMemoryMemoryMessageRepository";
import { Message } from "../Message";
import {
  PostMessageUseCase,
  PostMessageCommand,
} from "../post-message.usecase";
import { StubDateProvider } from "../StubDateProvider";
import { ViewTimelineUseCase } from "../ViewTimelineUseCase";

export const createMessageFixture = () => {
  const dateProvider = new StubDateProvider();
  const messageRepository = new InMemoryMessageRepository();
  const postMessageUseCase = new PostMessageUseCase(
    messageRepository,
    dateProvider
  );
  let thrownError: Error;
  const viewTimelineUseCase = new ViewTimelineUseCase(
    messageRepository,
    dateProvider
  );
  let timeline: {
    author: string;
    text: string;
    publicationTime: string;
  }[];

  return {
    givenNowIs(now: Date) {
      dateProvider.now = now;
    },
    givenTheFollowingMessageExist(messages: Message[]) {
      messageRepository.givenExistingMessages(messages);
    },
    async whenUserPostAmessage(postMessageCommand: PostMessageCommand) {
      try {
        await postMessageUseCase.handle(postMessageCommand);
      } catch (err) {
        thrownError = err;
      }
    },
    thenMessageShouldBe(expectedMessage: Message) {
      expect(expectedMessage).toEqual(
        messageRepository.getMessageById(expectedMessage.id)
      );
    },
    thenErrorShouldbe(expectedErrorClass: new () => Error) {
      expect(thrownError).toBeInstanceOf(expectedErrorClass);
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
    async whenUserSeesTheTimelineOfAlice(user: string) {
      timeline = await viewTimelineUseCase.handle({ user });
    },
    async whenUserEditMessage(editMessageCommand: {
      messageId: string;
      text: string;
    }) {},
  };
};

export type MessagingFixture = ReturnType<typeof createMessageFixture>;
