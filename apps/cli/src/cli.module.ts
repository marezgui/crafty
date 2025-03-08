import { CraftyModule } from '@crafty/crafty';
import { PrismaFolloweeRepository } from '@crafty/crafty/infra/PrismaFolloweeRepository';
import { PrismaMessageRepository } from '@crafty/crafty/infra/PrismaMessageRepository';
import { RealDateProvider } from '@crafty/crafty/infra/RealDateProvider';
import { Module } from '@nestjs/common';
import { commands } from './commands';
import { CliTimelinePresenter } from './cli.timeline.presenter';
import { CustomConsoleLogger } from './custom.console.logger';
import { PrismaService } from '@crafty/crafty/infra/prisma/prisma.service';

@Module({
  imports: [
    CraftyModule.register({
      MessageRepository: PrismaMessageRepository,
      FolloweeRepository: PrismaFolloweeRepository,
      DateProvider: RealDateProvider,
      PrismaClient: PrismaService,
    }),
  ],
  controllers: [],
  providers: [...commands, CliTimelinePresenter, CustomConsoleLogger],
})
export class CliModule {}
