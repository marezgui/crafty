import { TimelinePresenter } from '../application/TimelinePresenter';
import { ViewWallUseCase } from '../application/usecases/ViewWallUseCase';
import { DefaultTimelinePresenter } from '../../../../apps/cli/src/default.timeline.presenter';
import { StubDateProvider } from '../infra/StubDateProvider';

export const createWallFixture = ({
  messageRepository,
  followeeRepository,
}) => {
  const dateProvider = new StubDateProvider();
  let wall: {
    author: string;
    text: string;
    publicationTime: string;
  }[];
  const viewWallUseCase = new ViewWallUseCase(
    messageRepository,
    followeeRepository,
  );
  const defaultWallPresenter = new DefaultTimelinePresenter(dateProvider);
  const wallPresenter: TimelinePresenter = {
    show(theTimeline) {
      wall = defaultWallPresenter.show(theTimeline);
    },
  };

  return {
    givenNowIs(now: Date) {
      dateProvider.now = now;
    },
    async whenUserSeesTheWallOf(user: string) {
      await viewWallUseCase.handle({ user }, wallPresenter);
    },
    thenUserShouldSee(
      expectedWall: {
        author: string;
        text: string;
        publicationTime: string;
      }[],
    ) {
      expect(wall).toEqual(expectedWall);
    },
  };
};

export type WallFixture = ReturnType<typeof createWallFixture>;
