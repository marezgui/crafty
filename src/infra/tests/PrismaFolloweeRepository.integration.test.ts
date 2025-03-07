import { PrismaClient } from "@prisma/client";
import { exec } from "child_process";
import { promisify } from "util";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { PrismaFolloweeRepository } from "../PrismaFolloweeRepository";

const asyncExec = promisify(exec);

describe("PrismaFolloweeRepository", () => {
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaClient;

  beforeAll(async () => {
    container = await new PostgreSqlContainer()
      .withDatabase("crafty-test")
      .withUsername("crafty-test")
      .withPassword("crafty-test")
      .withExposedPorts(5432)
      .start();
    const databaseUrl = container.getConnectionUri();

    prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

    await asyncExec(`DATABASE_URL=${databaseUrl} npx prisma migrate deploy`);

    return prismaClient.$connect();
  });

  afterAll(async () => {
    await container.stop({ timeout: 1000 });
    return prismaClient.$disconnect();
  });

  beforeEach(async () => {
    await prismaClient.user.deleteMany();
    await prismaClient.$executeRawUnsafe('DELETE FROM "User" CASCADE');
    await prismaClient.user.createMany({
      data: [
        {
          name: "Alice",
          userId: "alice123",
        },
        {
          name: "Bob",
          userId: "bob123",
        },
        {
          name: "Charlie",
          userId: "charlie123",
        },
      ],
    });
  });

  test("saveFollowee() should save a new followee", async () => {
    const followeeRepository = new PrismaFolloweeRepository(prismaClient);

    await followeeRepository.saveFollowee({
      user: "Alice",
      followee: "Bob",
    });

    await followeeRepository.saveFollowee({
      user: "Alice",
      followee: "Charlie",
    });

    const alice = await prismaClient.user.findFirstOrThrow({
      where: { name: "Alice" },
      include: { following: true },
    });

    const aliceFollowees = alice.following.map((f) => f.name);

    expect(aliceFollowees).toEqual(["Bob", "Charlie"]);
  });

  test("saveFollowee() should save a new followee when there was no followees before", async () => {
    const followeeRepository = new PrismaFolloweeRepository(prismaClient);

    await followeeRepository.saveFollowee({
      user: "Alice",
      followee: "Charlie",
    });

    const alice = await prismaClient.user.findFirstOrThrow({
      where: { name: "Alice" },
      include: { following: true },
    });

    const aliceFollowees = alice.following.map((f) => f.name);

    expect(aliceFollowees).toEqual(["Charlie"]);
  });

  test("getFolloweesOf() should return the user folowees", async () => {
    const followeeRepository = new PrismaFolloweeRepository(prismaClient);

    await followeeRepository.saveFollowee({
      user: "Alice",
      followee: "Bob",
    });

    await followeeRepository.saveFollowee({
      user: "Alice",
      followee: "Charlie",
    });

    await followeeRepository.saveFollowee({
      user: "Bob",
      followee: "Charlie",
    });

    const [alice, bob] = await Promise.all([
      prismaClient.user.findFirstOrThrow({
        where: { name: "Alice" },
        include: { following: true },
      }),
      prismaClient.user.findFirstOrThrow({
        where: { name: "Bob" },
        include: { following: true },
      }),
    ]);

    const aliceFollowees = alice.following.map((f) => f.name);
    const bobFollowees = bob.following.map((f) => f.name);

    expect([aliceFollowees, bobFollowees]).toEqual([
      ["Bob", "Charlie"],
      ["Charlie"],
    ]);
  });
});
