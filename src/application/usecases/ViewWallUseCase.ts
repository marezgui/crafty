import { Timeline } from "../../domain/Timeline";
import { DateProvider } from "../DateProvider";
import { FolloweeRepository } from "../FolloweeRepository";
import { MessageRepository } from "../MessageRepository";

export class ViewWallUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly followeeRepository: FolloweeRepository,
    private readonly dateProvider: DateProvider
  ) {}

  async handle({ user }): Promise<
    {
      author: string;
      text: string;
      publicationTime: string;
    }[]
  > {
    const followees = await this.followeeRepository.getFolloweesOf(user);
    const messagesOfUser = (
      await Promise.all(
        [user, ...followees].map((user) =>
          this.messageRepository.getMessagesByUser(user)
        )
      )
    ).flat();

    const timeline = new Timeline(messagesOfUser, this.dateProvider.getNow());
    return timeline.data;
  }
}
