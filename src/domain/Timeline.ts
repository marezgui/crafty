import { Message } from "./Message";

const ONE_MINUTE_IN_MS = 60000;

export class Timeline {
  constructor(
    private readonly messages: Message[],
    private readonly now: Date
  ) {}

  get data() {
    this.messages.sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
    );

    return this.messages.map((message) => ({
      author: message.author,
      text: message.text,
      publicationTime: this.publicationTime(message.publishedAt),
    }));
  }

  private publicationTime(publishedAt: Date) {
    const diff = this.now.getTime() - publishedAt.getTime();
    const minutesAgo = Math.floor(diff / ONE_MINUTE_IN_MS);

    if (minutesAgo < 1) {
      return "less than a minute ago";
    } else if (minutesAgo < 2) {
      return "1 minute ago";
    }

    return `${minutesAgo} minutes ago`;
  }
}
