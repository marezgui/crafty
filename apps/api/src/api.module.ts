import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { PrismaMessageRepository } from '@crafty/crafty/infra/PrismaMessageRepository';
import { CraftyModule } from '@crafty/crafty';
import { PrismaService } from '@crafty/crafty/infra/prisma/prisma.service';
import { PrismaFolloweeRepository } from '@crafty/crafty/infra/PrismaFolloweeRepository';
import { RealDateProvider } from '@crafty/crafty/infra/RealDateProvider';

@Module({
  imports: [
    CraftyModule.register({
      MessageRepository: PrismaMessageRepository,
      FolloweeRepository: PrismaFolloweeRepository,
      DateProvider: RealDateProvider,
      PrismaClient: PrismaService,
    }),
  ],
  controllers: [ApiController],
  providers: [],
})
export class ApiModule {}
