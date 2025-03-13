import {
  EditMessageCommand,
  EditMessageUseCase,
} from '@crafty/crafty/application/usecases/EditMessageUseCase';
import {
  PostMessageCommand,
  PostMessageUseCase,
} from '@crafty/crafty/application/usecases/PostMessageUseCase';
import { ViewTimelineUseCase } from '@crafty/crafty/application/usecases/ViewTimelineUseCase';
import { Command, CommandRunner } from 'nest-commander';
import { CliTimelinePresenter } from './cli.timeline.presenter';
import {
  FollowUserCommand,
  FollowUserUseCase,
} from '@crafty/crafty/application/usecases/FollowUserUseCase';
import { ViewWallUseCase } from '@crafty/crafty/application/usecases/ViewWallUseCase';

@Command({ name: 'post', arguments: '<user> <message>' })
export class PostCommand extends CommandRunner {
  constructor(private readonly postMessageUseCase: PostMessageUseCase) {
    super();
  }

  async run([author, text]: string[]): Promise<void> {
    const postMessageCommand: PostMessageCommand = {
      id: `${Math.floor(Math.random() * 10000)}`,
      author,
      text,
    };

    try {
      const result = await this.postMessageUseCase.handle(postMessageCommand);
      if (result.isOk()) {
        console.log('✅ Message posté');
        process.exit(0);
      } else {
        console.error('❌', result.error);
        process.exit(1);
      }
    } catch (err) {
      console.error('❌', err);
      process.exit(1);
    }
  }
}

@Command({ name: 'view', arguments: '<user>' })
export class ViewCommand extends CommandRunner {
  constructor(
    private readonly cliPresenter: CliTimelinePresenter,
    private readonly viewMessageUseCase: ViewTimelineUseCase,
  ) {
    super();
  }

  async run([user]: string[]): Promise<void> {
    try {
      const timeline = await this.viewMessageUseCase.handle(
        { user },
        this.cliPresenter,
      );

      console.table(timeline);
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }
}

@Command({ name: 'edit', arguments: '<message> <new message>' })
export class EditCommand extends CommandRunner {
  constructor(private readonly editMessageUseCase: EditMessageUseCase) {
    super();
  }

  async run([messageId, message]: string[]): Promise<void> {
    const editMessageCommand: EditMessageCommand = {
      messageId,
      text: message,
    };

    try {
      const result = await this.editMessageUseCase.handle(editMessageCommand);
      if (result.isOk()) {
        console.log('✅ Message edité');
        process.exit(0);
      } else {
        console.error('❌', result.error);
        process.exit(1);
      }
    } catch (err) {
      console.error('❌', err);
      process.exit(1);
    }
  }
}

@Command({ name: 'follow', arguments: '<user> <user to follow>' })
export class FollowCommand extends CommandRunner {
  constructor(private readonly followUserUseCase: FollowUserUseCase) {
    super();
  }

  async run([user, userToFollow]: string[]): Promise<void> {
    const followUserCommand: FollowUserCommand = {
      user,
      userToFollow,
    };

    try {
      await this.followUserUseCase.handle(followUserCommand);
      console.log(`✅ Tu suis maintenant ${userToFollow}`);
      process.exit(0);
    } catch (err) {
      console.error('❌', err);
      process.exit(1);
    }
  }
}

@Command({ name: 'wall', arguments: '<user>' })
export class WallCommand extends CommandRunner {
  constructor(
    private readonly cliPresenter: CliTimelinePresenter,
    private readonly viewWallUseCase: ViewWallUseCase,
  ) {
    super();
  }

  async run([user]: string[]): Promise<void> {
    try {
      const timeline = await this.viewWallUseCase.handle(
        { user },
        this.cliPresenter,
      );
      console.table(timeline);
      process.exit(0);
    } catch (err) {
      console.error('❌', err);
      process.exit(1);
    }
  }
}

export const commands = [
  PostCommand,
  ViewCommand,
  EditCommand,
  FollowCommand,
  WallCommand,
];
