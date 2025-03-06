import * as path from "path";
import * as fs from "fs";
import { FileSystemFolloweeRepository } from "../FileSystemFolloweeRepository";

const testFolloweesPath = path.join(__dirname, "followees.json");

describe("FileSystemFolloweeRepository", () => {
  beforeEach(async () => {
    await fs.promises.writeFile(testFolloweesPath, JSON.stringify({}));
  });
  test("saveFollowee() should save a new followee", async () => {
    const followeeRepository = new FileSystemFolloweeRepository(
      testFolloweesPath
    );

    await fs.promises.writeFile(
      testFolloweesPath,
      JSON.stringify({
        Alice: ["Bob"],
        Bob: ["Charlie"],
      })
    );

    await followeeRepository.saveFollowee({
      user: "Alice",
      followee: "Charlie",
    });

    const followeesData = await fs.promises.readFile(testFolloweesPath);
    const followeesJSON = JSON.parse(followeesData.toString());

    expect(followeesJSON).toEqual({
      Alice: ["Bob", "Charlie"],
      Bob: ["Charlie"],
    });
  });

  test("saveFollowee() should save a new followee when there was no followees before", async () => {
    const followeeRepository = new FileSystemFolloweeRepository(
      testFolloweesPath
    );

    await fs.promises.writeFile(
      testFolloweesPath,
      JSON.stringify({
        Bob: ["Charlie"],
      })
    );

    await followeeRepository.saveFollowee({
      user: "Alice",
      followee: "Charlie",
    });

    const followeesData = await fs.promises.readFile(testFolloweesPath);
    const followeesJSON = JSON.parse(followeesData.toString());

    expect(followeesJSON).toEqual({
      Alice: ["Charlie"],
      Bob: ["Charlie"],
    });
  });

  test("getFolloweesOf() should return the user folowees", async () => {
    const followeeRepository = new FileSystemFolloweeRepository(
      testFolloweesPath
    );

    await fs.promises.writeFile(
      testFolloweesPath,
      JSON.stringify({
        Alice: ["Bob", "Charlie"],
        Bob: ["Charlie"],
      })
    );

    const [aliceFollowees, bobFollowees] = await Promise.all([
      followeeRepository.getFolloweesOf("Alice"),
      followeeRepository.getFolloweesOf("Bob"),
    ]);

    expect(aliceFollowees).toEqual(["Bob", "Charlie"]);
    expect(bobFollowees).toEqual(["Charlie"]);
  });
});
