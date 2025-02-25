import { MessageRepository } from "./MessageRepository";

export class ViewTimelineUseCase {
  constructor(private readonly messageRepository: MessageRepository) {}

  async handle({ user }: { user: string }): Promise<
    {
      author: string;
      text: string;
      publicationTime: string;
    }[]
  > {
    const messagesOfUser = await this.messageRepository.getAllUser(user);

    messagesOfUser.sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
    );

    return [
      {
        author: messagesOfUser[0].author,
        text: messagesOfUser[0].text,
        publicationTime: "1 minute ago",
      },
      {
        author: messagesOfUser[1].author,
        text: messagesOfUser[1].text,
        publicationTime: "12 minutes ago",
      },
    ];
  }
}
