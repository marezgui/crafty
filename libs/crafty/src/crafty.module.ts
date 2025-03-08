import { ClassProvider, DynamicModule, Module } from '@nestjs/common';
import { PostMessageUseCase } from './application/usecases/PostMessageUseCase';
import { EditMessageUseCase } from './application/usecases/EditMessageUseCase';
import { FollowUserUseCase } from './application/usecases/FollowUserUseCase';
import { ViewWallUseCase } from './application/usecases/ViewWallUseCase';
import { ViewTimelineUseCase } from './application/usecases/ViewTimelineUseCase';
import { DefaultTimelinePresenter } from '../../../apps/cli/src/default.timeline.presenter';
import { MessageRepository } from './application/MessageRepository';
import { FolloweeRepository } from './application/FolloweeRepository';
import { DateProvider } from './application/DateProvider';
import { PrismaClient } from '@prisma/client';

@Module({})
export class CraftyModule {
  static register(providers: {
    MessageRepository: ClassProvider<MessageRepository>['useClass'];
    FolloweeRepository: ClassProvider<FolloweeRepository>['useClass'];
    DateProvider: ClassProvider<DateProvider>['useClass'];
    PrismaClient: ClassProvider<PrismaClient>['useClass'];
  }): DynamicModule {
    return {
      module: CraftyModule,
      providers: [
        PostMessageUseCase,
        EditMessageUseCase,
        FollowUserUseCase,
        ViewTimelineUseCase,
        ViewWallUseCase,
        DefaultTimelinePresenter,
        {
          provide: MessageRepository,
          useClass: providers.MessageRepository,
        },
        {
          provide: FolloweeRepository,
          useClass: providers.FolloweeRepository,
        },
        {
          provide: DateProvider,
          useClass: providers.DateProvider,
        },
        {
          provide: PrismaClient,
          useClass: providers.PrismaClient,
        },
      ],
      exports: [
        PostMessageUseCase,
        EditMessageUseCase,
        FollowUserUseCase,
        ViewTimelineUseCase,
        ViewWallUseCase,
        DefaultTimelinePresenter,
      ],
    };
  }
}
