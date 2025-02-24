#!/usr/bin/env node

import { Command } from "commander";
import {
  DateProvider,
  PostMessageCommand,
  PostMessageUseCase,
} from "./src/post-message.usecase";
import { InMemoryMessageRepository } from "./src/InMemoryMemoryMessageRepository";

class RealDateProvider implements DateProvider {
  getNow(): Date {
    return new Date();
  }
}

const messageRepository = new InMemoryMessageRepository();
const dateProvider = new RealDateProvider();
const postMessageCase = new PostMessageUseCase(messageRepository, dateProvider);
const program = new Command();

program
  .version("1.0.0")
  .description("crafty social network")
  .addCommand(
    new Command("post")
      .argument("<user>", "the current user")
      .argument("<message>", "the message to post")
      .action((user, message) => {
        const postMessageCommand: PostMessageCommand = {
          id: "some-id",
          author: user,
          text: message,
        };

        try {
          postMessageCase.handle(postMessageCommand);
          console.log("✅ Message posté");
          console.table([messageRepository.message]);
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
