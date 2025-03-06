#!/usr/bin/env node

import { Command } from "commander";

import { FileSystemMessageRepository } from "./src/infra/FileSystemMessageRepository";
import { ViewTimelineUseCase } from "./src/application/usecases/ViewTimelineUseCase";
import {
  PostMessageCommand,
  PostMessageUseCase,
} from "./src/application/usecases/PostMessageUseCase";
import {
  EditMessageCommand,
  EditMessageUseCase,
} from "./src/application/usecases/EditMessageUseCase";
import { ViewWallUseCase } from "./src/application/usecases/ViewWallUseCase";
import { RealDateProvider } from "./src/infra/RealDateProvider";
import {
  FollowUserCommand,
  FollowUserUseCase,
} from "./src/application/usecases/FollowUserUseCase";
import { FileSystemFolloweeRepository } from "./src/infra/FileSystemFolloweeRepository";

const messageRepository = new FileSystemMessageRepository();
const followUserRepository = new FileSystemFolloweeRepository();
const dateProvider = new RealDateProvider();

const postMessageCase = new PostMessageUseCase(messageRepository, dateProvider);
const viewTimelineUseCase = new ViewTimelineUseCase(
  messageRepository,
  dateProvider
);
const editMessageUseCase = new EditMessageUseCase(messageRepository);
const followUserUseCase = new FollowUserUseCase(followUserRepository);
const viewWallUseCase = new ViewWallUseCase(
  messageRepository,
  followUserRepository,
  dateProvider
);

const program = new Command();

program
  .version("1.0.0")
  .description("crafty social network")
  .addCommand(
    new Command("post")
      .argument("<user>", "the current user")
      .argument("<message>", "the message to post")
      .action(async (user, message) => {
        const postMessageCommand: PostMessageCommand = {
          id: `${Math.floor(Math.random() * 10000)}`,
          author: user,
          text: message,
        };

        try {
          await postMessageCase.handle(postMessageCommand);
          console.log("✅ Message posté");
          process.exit(0);
        } catch (err) {
          console.error("❌", err);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command("view")
      .argument("<user>", "the user timeline you want to view")
      .action(async (user) => {
        try {
          const timeline = await viewTimelineUseCase.handle({ user });
          console.table(timeline);
          process.exit(0);
        } catch (e) {
          console.error(e);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command("edit")
      .argument("<message>", "the message id of the message to edit")
      .argument("<new message>", "the new message")
      .action(async (messageId, message) => {
        const editMessageCommand: EditMessageCommand = {
          messageId,
          text: message,
        };

        try {
          await editMessageUseCase.handle(editMessageCommand);
          console.log("✅ Message edité");
          process.exit(0);
        } catch (err) {
          console.error("❌", err);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command("follow")
      .argument("<user>", "the current user")
      .argument("<user to follow>", "the user to follow")
      .action(async (user, userToFollow) => {
        const followUserCommand: FollowUserCommand = {
          user,
          userToFollow,
        };

        try {
          await followUserUseCase.handle(followUserCommand);
          console.log(`✅ Tu suis maintenant ${userToFollow}`);
          process.exit(0);
        } catch (err) {
          console.error("❌", err);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command("wall")
      .argument("<user>", "the user to view the wall of")
      .action(async (user) => {
        try {
          const timeline = await viewWallUseCase.handle({ user });
          console.table(timeline);
          process.exit(0);
        } catch (err) {
          console.error("❌", err);
          process.exit(1);
        }
      })
  );

async function main() {
  await program.parseAsync();
}

main();
