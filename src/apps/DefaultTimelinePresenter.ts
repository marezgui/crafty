import { Timeline } from "../domain/Timeline";
import { TimelinePresenter } from "../application/TimelinePresenter";
import { DateProvider } from "../application/DateProvider";

const ONE_MINUTE_IN_MS = 60000;

export class DefaultTimelinePresenter implements TimelinePresenter {
  constructor(private readonly dateProvider: DateProvider) {}

  show(timeline: Timeline): {
    author: string;
    text: string;
    publicationTime: string;
  }[] {
    const messages = timeline.data;

    return messages.map((message) => ({
      author: message.author,
      text: message.text,
      publicationTime: this.computePublicationTime(message.publishedAt),
    }));
  }

  private computePublicationTime(publishedAt: Date) {
    const now = this.dateProvider.getNow();
    const diff = now.getTime() - publishedAt.getTime();
    const minutesAgo = Math.floor(diff / ONE_MINUTE_IN_MS);

    if (minutesAgo < 1) {
      return "less than a minute ago";
    } else if (minutesAgo < 2) {
      return "1 minute ago";
    }

    return `${minutesAgo} minutes ago`;
  }
}
