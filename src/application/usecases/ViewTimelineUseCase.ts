import { DateProvider } from "../DateProvider";
import { MessageRepository } from "../MessageRepository";

const ONE_MINUTE_IN_MS = 60000;

export class ViewTimelineUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly dateProvider: DateProvider
  ) {}

  async handle({ user }: { user: string }): Promise<
    {
      author: string;
      text: string;
      publicationTime: string;
    }[]
  > {
    const messagesOfUser = await this.messageRepository.getMessagesByUser(user);

    messagesOfUser.sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
    );

    return messagesOfUser.map((message) => ({
      author: message.author,
      text: message.text,
      publicationTime: this.publicationTime(message.publishedAt),
    }));
  }

  private publicationTime = (publishedAt: Date) => {
    const now = this.dateProvider.getNow();
    const diff = now.getTime() - publishedAt.getTime();
    const minutesAgo = Math.floor(diff / ONE_MINUTE_IN_MS);

    if (minutesAgo < 1) {
      return "less than a minute ago";
    } else if (minutesAgo < 2) {
      return "1 minute ago";
    }

    return `${minutesAgo} minutes ago`;
  };
}
