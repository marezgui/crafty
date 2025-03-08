import { Message } from './Message';

export class Timeline {
  constructor(private readonly messages: Message[]) {}

  get data() {
    this.messages.sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
    );

    return this.messages.map((message) => message.data);
  }
}
