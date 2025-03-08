#!/usr/bin/env node

import { Command } from "commander";

import { PrismaClient } from "@prisma/client";
import {
  EditMessageUseCase,
  EditMessageCommand,
} from "../application/usecases/EditMessageUseCase";
import {
  FollowUserUseCase,
  FollowUserCommand,
} from "../application/usecases/FollowUserUseCase";
import {
  PostMessageUseCase,
  PostMessageCommand,
} from "../application/usecases/PostMessageUseCase";
import { ViewTimelineUseCase } from "../application/usecases/ViewTimelineUseCase";
import { ViewWallUseCase } from "../application/usecases/ViewWallUseCase";
import { RealDateProvider } from "../infra/RealDateProvider";
import { PrismaFolloweeRepository } from "../infra/PrismaFolloweeRepository";
import { PrismaMessageRepository } from "../infra/PrismaMessageRepository";
import { TimelinePresenter } from "../application/TimelinePresenter";
import { Timeline } from "../domain/Timeline";
import { DefaultTimelinePresenter } from "./DefaultTimelinePresenter";

class CliTimelinePresenter implements TimelinePresenter {
  constructor(
    private readonly defaultTimelinePresenter: DefaultTimelinePresenter
  ) {}

  show(timeline: Timeline): void {
    console.table(this.defaultTimelinePresenter.show(timeline));
  }
}

const prismaClient = new PrismaClient();
const messageRepository = new PrismaMessageRepository(prismaClient);
const followUserRepository = new PrismaFolloweeRepository(prismaClient);
const dateProvider = new RealDateProvider();
const defaultTimelinePresenter = new DefaultTimelinePresenter(dateProvider);
const timelinePresenter = new CliTimelinePresenter(defaultTimelinePresenter);

const postMessageCase = new PostMessageUseCase(messageRepository, dateProvider);
const viewTimelineUseCase = new ViewTimelineUseCase(
  messageRepository,
  dateProvider
);
const editMessageUseCase = new EditMessageUseCase(messageRepository);
const followUserUseCase = new FollowUserUseCase(followUserRepository);
const viewWallUseCase = new ViewWallUseCase(
  messageRepository,
  followUserRepository
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
          const timeline = await viewTimelineUseCase.handle(
            { user },
            timelinePresenter
          );
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
          const timeline = await viewWallUseCase.handle(
            { user },
            timelinePresenter
          );
          console.table(timeline);
          process.exit(0);
        } catch (err) {
          console.error("❌", err);
          process.exit(1);
        }
      })
  );

async function main() {
  await prismaClient.$connect();
  await program.parseAsync();
  await prismaClient.$disconnect();
}

main();
