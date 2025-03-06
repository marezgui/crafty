import {
  FollowUserUseCase,
  FollowUserCommand,
} from "../application/usecases/FollowUserUseCase";
import { inMemoryFolloweeRepository } from "../infra/inMemoryFolloweesRepository";

export const createFollowingFixture = () => {
  const followeeRepository = new inMemoryFolloweeRepository();
  const followUserUseCase = new FollowUserUseCase(followeeRepository);

  return {
    async givenUserFollowees({
      user,
      followees,
    }: {
      user: string;
      followees: string[];
    }) {
      followeeRepository.givenExistingFollowees(
        followees.map((f) => ({
          user,
          followee: f,
        }))
      );
    },
    async whenUserFollows(followUserCommand: FollowUserCommand) {
      await followUserUseCase.handle(followUserCommand);
    },
    async whenUserUnFollows(unFollowCommand: {
      user: string;
      userToFollow: "Bob";
    }) {
      await followUserUseCase.handle(unFollowCommand);
    },
    async thenUserFolloweesAre(userFollowees: {
      user: string;
      followees: string[];
    }) {
      const actualFollowees = await followeeRepository.getFolloweesOf(
        userFollowees.user
      );

      expect(actualFollowees).toEqual(userFollowees.followees);
    },
    followeeRepository,
  };
};

export type FollowingFixture = ReturnType<typeof createFollowingFixture>;
