import { Timeline } from "../../domain/Timeline";
import { DateProvider } from "../DateProvider";
import { FolloweeRepository } from "../FolloweeRepository";
import { MessageRepository } from "../MessageRepository";
import { TimelinePresenter } from "../TimelinePresenter";

export class ViewWallUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly followeeRepository: FolloweeRepository
  ) {}

  async handle({ user }, timelinePresenter: TimelinePresenter): Promise<void> {
    const followees = await this.followeeRepository.getFolloweesOf(user);
    const messagesOfUser = (
      await Promise.all(
        [user, ...followees].map((user) =>
          this.messageRepository.getMessagesByUser(user)
        )
      )
    ).flat();

    const timeline = new Timeline(messagesOfUser);
    timelinePresenter.show(timeline);
  }
}
