import {
  createFollowingFixture,
  FollowingFixture,
} from "./createFollowingFixture";

describe("Feature : Following a user", () => {
  let fixture: FollowingFixture;

  beforeEach(() => {
    fixture = createFollowingFixture();
  });

  test("Alice can follow Bob", async () => {
    fixture.givenUserFollowees({
      user: "Alice",
      followees: ["Charlie"],
    });

    await fixture.whenUserFollows({
      user: "Alice",
      userToFollow: "Bob",
    });

    await fixture.thenUserFolloweesAre({
      user: "Alice",
      followees: ["Charlie", "Bob"],
    });
  });

  xtest("Alice can unfollow Bob", async () => {
    fixture.givenUserFollowees({
      user: "Alice",
      followees: ["Charlie", "Bob"],
    });

    await fixture.whenUserUnFollows({
      user: "Alice",
      userToFollow: "Bob",
    });

    await fixture.thenUserFolloweesAre({
      user: "Alice",
      followees: ["Charlie"],
    });
  });
});
