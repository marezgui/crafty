import { ViewWallUseCase } from "../application/usecases/ViewWallUseCase";
import { StubDateProvider } from "../infra/StubDateProvider";

export const createWallFixture = ({
  messageRepository,
  followeeRepository,
}) => {
  let dateProvider = new StubDateProvider();
  let wall: {
    author: string;
    text: string;
    publicationTime: string;
  }[];
  const viewWallUseCase = new ViewWallUseCase(
    messageRepository,
    followeeRepository,
    dateProvider
  );

  return {
    givenNowIs(now: Date) {
      dateProvider.now = now;
    },
    async whenUserSeesTheWallOf(user: string) {
      wall = await viewWallUseCase.handle({ user });
    },
    thenUserShouldSee(
      expectedWall: {
        author: string;
        text: string;
        publicationTime: string;
      }[]
    ) {
      expect(wall).toEqual(expectedWall);
    },
  };
};

export type WallFixture = ReturnType<typeof createWallFixture>;
