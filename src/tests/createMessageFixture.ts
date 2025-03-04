import {
  PostMessageUseCase,
  PostMessageCommand,
} from "../application/usecases/PostMessageUseCase";
import { ViewTimelineUseCase } from "../application/usecases/ViewTimelineUseCase";
import { Message } from "../domain/Message";
import { InMemoryMessageRepository } from "../infra/InMemoryMessageRepository";
import { StubDateProvider } from "../infra/StubDateProvider";
import {
  EditMessageCommand,
  EditMessageUseCase,
} from "../application/usecases/EditMessageUseCase";

export const createMessageFixture = () => {
  const dateProvider = new StubDateProvider();
  const messageRepository = new InMemoryMessageRepository();
  let thrownError: Error;
  let timeline: {
    author: string;
    text: string;
    publicationTime: string;
  }[];

  const postMessageUseCase = new PostMessageUseCase(
    messageRepository,
    dateProvider
  );
  const editMessageUseCase = new EditMessageUseCase(messageRepository);
  const viewTimelineUseCase = new ViewTimelineUseCase(
    messageRepository,
    dateProvider
  );

  return {
    // GIVEN
    givenNowIs(now: Date) {
      dateProvider.now = now;
    },
    givenTheFollowingMessageExist(messages: Message[]) {
      messageRepository.givenExistingMessages(messages);
    },
    // WHEN
    async whenUserPostAmessage(postMessageCommand: PostMessageCommand) {
      try {
        await postMessageUseCase.handle(postMessageCommand);
      } catch (err) {
        thrownError = err;
      }
    },
    async whenUserEditMessage(editMessageCommand: EditMessageCommand) {
      try {
        await editMessageUseCase.handle(editMessageCommand);
      } catch (err) {
        thrownError = err;
      }
    },
    async whenUserSeesTheTimelineOfAlice(user: string) {
      timeline = await viewTimelineUseCase.handle({ user });
    },
    // THEN
    async thenMessageShouldBe(expectedMessage: Message) {
      console.log("🚀", { expectedMessage, messageRepository });
      const message = await messageRepository.getById(expectedMessage.id);
      expect(message).toEqual(expectedMessage);
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
  };
};

export type MessagingFixture = ReturnType<typeof createMessageFixture>;
