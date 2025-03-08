import { PrismaClient } from '@prisma/client';
import {
  Followee,
  FolloweeRepository,
} from '../application/FolloweeRepository';

export class PrismaFolloweeRepository implements FolloweeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async saveFollowee(followee: Followee): Promise<void> {
    await this.upsertUser(followee.user);
    await this.upsertUser(followee.followee);
    await this.prisma.user.update({
      where: { name: followee.user },
      data: {
        following: {
          connectOrCreate: [
            {
              where: { name: followee.followee },
              create: { name: followee.followee },
            },
          ],
        },
      },
    });
  }

  async getFolloweesOf(user: string): Promise<string[]> {
    const theUser = await this.prisma.user.findFirstOrThrow({
      where: { name: user },
      include: {
        following: true,
      },
    });

    return theUser.following.map((f) => f.name);
  }

  private async upsertUser(user: string) {
    await this.prisma.user.upsert({
      update: { name: user },
      create: { name: user },
      where: { name: user },
    });
  }
}
