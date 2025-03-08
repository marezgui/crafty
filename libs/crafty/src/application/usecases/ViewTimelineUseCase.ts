import { Injectable } from '@nestjs/common';
import { Timeline } from '../../domain/Timeline';
import { DateProvider } from '../DateProvider';
import { MessageRepository } from '../MessageRepository';
import { TimelinePresenter } from '../TimelinePresenter';

@Injectable()
export class ViewTimelineUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly dateProvider: DateProvider,
  ) {}

  async handle(
    { user }: { user: string },
    timelinePresenter: TimelinePresenter,
  ): Promise<void> {
    const messagesOfUser = await this.messageRepository.getMessagesByUser(user);

    const timeline = new Timeline(messagesOfUser);

    timelinePresenter.show(timeline);
  }
}
