#!/usr/bin/env node

import { Command } from "commander";
import {
  DateProvider,
  PostMessageCommand,
  PostMessageUseCase,
} from "./src/post-message.usecase";
import { FileSystemMessageRepository } from "./src/FileSystemMessageRepository";
import { ViewTimelineUseCase } from "./src/ViewTimelineUseCase";

class RealDateProvider implements DateProvider {
  getNow(): Date {
    return new Date();
  }
}

const messageRepository = new FileSystemMessageRepository();
const dateProvider = new RealDateProvider();
const postMessageCase = new PostMessageUseCase(messageRepository, dateProvider);
const viewTimelineUseCase = new ViewTimelineUseCase(
  messageRepository,
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
  );

async function main() {
  await program.parseAsync();
}

main();
