import { FastifyReply } from 'fastify';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import {
  PostMessageCommand,
  PostMessageUseCase,
} from '@crafty/crafty/application/usecases/PostMessageUseCase';
import {
  EditMessageCommand,
  EditMessageUseCase,
} from '@crafty/crafty/application/usecases/EditMessageUseCase';
import {
  FollowUserCommand,
  FollowUserUseCase,
} from '@crafty/crafty/application/usecases/FollowUserUseCase';
import { ViewTimelineUseCase } from '@crafty/crafty/application/usecases/ViewTimelineUseCase';
import { ViewWallUseCase } from '@crafty/crafty/application/usecases/ViewWallUseCase';
import { ApiTimelinePresenter } from './api.timeline.presenter';

@Controller()
export class ApiController {
  constructor(
    private readonly postMessageUseCase: PostMessageUseCase,
    private readonly editMessageUseCase: EditMessageUseCase,
    private readonly followUserUseCase: FollowUserUseCase,
    private readonly viewTimelineUseCase: ViewTimelineUseCase,
    private readonly viewWallUseCase: ViewWallUseCase,
  ) {}

  @Post('/post')
  async postMessage(@Body() body: { user: string; message: string }) {
    const postMessageCommand: PostMessageCommand = {
      id: `${Math.floor(Math.random() * 10000)}`,
      author: body.user,
      text: body.message,
    };

    try {
      await this.postMessageUseCase.handle(postMessageCommand);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @Post('/edit')
  async editMessage(
    @Body() body: { user: string; messageId: string; message: string },
  ) {
    const editMessageCommand: EditMessageCommand = {
      messageId: body.messageId,
      text: body.message,
    };

    try {
      await this.editMessageUseCase.handle(editMessageCommand);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @Post('/follow')
  async followMessage(@Body() body: { user: string; followee: string }) {
    const followUserCommand: FollowUserCommand = {
      user: body.user,
      userToFollow: body.followee,
    };

    try {
      await this.followUserUseCase.handle(followUserCommand);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @Get('/view')
  async viewTimeline(
    @Query() query: { user: string },
    @Res() res: FastifyReply,
  ) {
    const presenter = new ApiTimelinePresenter(res);

    await this.viewTimelineUseCase.handle(
      {
        user: query.user,
      },
      presenter,
    );
  }

  @Get('/wall')
  async viewWall(@Query() query: { user: string }, @Res() res: FastifyReply) {
    const presenter = new ApiTimelinePresenter(res);

    await this.viewWallUseCase.handle(
      {
        user: query.user,
      },
      presenter,
    );
  }
}
