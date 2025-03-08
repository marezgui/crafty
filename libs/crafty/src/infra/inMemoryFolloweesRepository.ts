import {
  Followee,
  FolloweeRepository,
} from '../application/FolloweeRepository';

export class inMemoryFolloweeRepository implements FolloweeRepository {
  followeesByUser = new Map<string, string[]>();

  saveFollowee(followee: Followee): Promise<void> {
    this.addFollowee(followee);

    return Promise.resolve();
  }

  async givenExistingFollowees(followees: Followee[]) {
    await Promise.all(followees.map((f) => this.addFollowee(f)));
  }

  private addFollowee({ user, followee }: Followee) {
    const existingFollowees = this.followeesByUser.get(user) ?? [];
    existingFollowees.push(followee);
    this.followeesByUser.set(user, existingFollowees);
  }

  async getFolloweesOf(user: string): Promise<string[]> {
    return Promise.resolve(this.followeesByUser.get(user) ?? []);
  }
}
