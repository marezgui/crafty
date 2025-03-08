import Fastify, { FastifyInstance, FastifyReply } from "fastify";
import * as httpErrors from "http-errors";
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

class ApiTimelinePresenter implements TimelinePresenter {
  constructor(private readonly res: FastifyReply) {}

  show(timeline: Timeline): void {
    this.res.status(200).send(timeline.data);
  }
}

const prismaClient = new PrismaClient();
const messageRepository = new PrismaMessageRepository(prismaClient);
const followUserRepository = new PrismaFolloweeRepository(prismaClient);
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
  followUserRepository
);

const fastify = Fastify({ logger: true });

const routes = async (fastifyInstance: FastifyInstance) => {
  fastifyInstance.post<{ Body: { user: string; message: string } }>(
    "/post",
    {},
    async (req, res) => {
      const postMessageCommand: PostMessageCommand = {
        id: `${Math.floor(Math.random() * 10000)}`,
        author: req.body.user,
        text: req.body.message,
      };

      try {
        await postMessageCase.handle(postMessageCommand);
        res.status(201);
      } catch (err) {
        res.send(httpErrors[500](err));
      }
    }
  );

  fastifyInstance.post<{
    Body: { user: string; messageId: string; message: string };
  }>("/edit", {}, async (req, res) => {
    const editMessageCommand: EditMessageCommand = {
      messageId: req.body.messageId,
      text: req.body.message,
    };

    try {
      await editMessageUseCase.handle(editMessageCommand);
      res.status(201);
    } catch (err) {
      res.send(httpErrors[500](err));
    }
  });

  fastifyInstance.post<{
    Body: { user: string; followee: string };
  }>("/follow", {}, async (req, res) => {
    const followUserCommand: FollowUserCommand = {
      user: req.body.user,
      userToFollow: req.body.followee,
    };

    try {
      await followUserUseCase.handle(followUserCommand);
      res.status(201);
    } catch (err) {
      res.send(httpErrors[500](err));
    }
  });

  fastifyInstance.get<{
    Querystring: { user: string };
  }>("/view", {}, async (req, res) => {
    const timelinePresenter = new ApiTimelinePresenter(res);

    try {
      await viewTimelineUseCase.handle(
        {
          user: req.query.user,
        },
        timelinePresenter
      );
    } catch (err) {
      res.send(httpErrors[500](err));
    }
  });

  fastifyInstance.get<{
    Body: { user: string };
  }>("/wall", {}, async (req, res) => {
    const timelinePresenter = new ApiTimelinePresenter(res);

    try {
      await viewWallUseCase.handle({ user: req.body.user }, timelinePresenter);
    } catch (err) {
      res.send(httpErrors[500](err));
    }
  });
};

fastify.register(routes);

fastify.addHook("onClose", async () => {
  await prismaClient.$disconnect;
});

async function main() {
  try {
    await prismaClient.$connect();
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();
