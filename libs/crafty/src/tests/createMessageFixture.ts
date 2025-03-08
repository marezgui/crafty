import {
  PostMessageUseCase,
  PostMessageCommand,
} from '../application/usecases/PostMessageUseCase';
import { ViewTimelineUseCase } from '../application/usecases/ViewTimelineUseCase';
import { Message } from '../domain/Message';
import { InMemoryMessageRepository } from '../infra/InMemoryMessageRepository';
import { StubDateProvider } from '../infra/StubDateProvider';
import {
  EditMessageCommand,
  EditMessageUseCase,
} from '../application/usecases/EditMessageUseCase';
import { DefaultTimelinePresenter } from '../../../../apps/cli/src/default.timeline.presenter';
import { TimelinePresenter } from '../application/TimelinePresenter';

export const createMessagingFixture = () => {
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
    dateProvider,
  );
  const editMessageUseCase = new EditMessageUseCase(messageRepository);
  const viewTimelineUseCase = new ViewTimelineUseCase(
    messageRepository,
    dateProvider,
  );
  const defaultTimelinePresenter = new DefaultTimelinePresenter(dateProvider);
  const timelinePresenter: TimelinePresenter = {
    show(theTimeline) {
      timeline = defaultTimelinePresenter.show(theTimeline);
    },
  };

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
      const result = await postMessageUseCase.handle(postMessageCommand);

      if (result.isErr()) {
        thrownError = result.error;
      }
    },
    async whenUserEditMessage(editMessageCommand: EditMessageCommand) {
      const result = await editMessageUseCase.handle(editMessageCommand);

      if (result.isErr()) {
        thrownError = result.error;
      }
    },
    async whenUserSeesTheTimelineOfAlice(user: string) {
      await viewTimelineUseCase.handle({ user }, timelinePresenter);
    },
    // THEN
    async thenMessageShouldBe(expectedMessage: Message) {
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
      }[],
    ) {
      expect(timeline).toEqual(expectedTimeline);
    },
    messageRepository,
  };
};

export type MessagingFixture = ReturnType<typeof createMessagingFixture>;
