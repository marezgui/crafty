import {
  EmptyMessageError,
  Message,
  MessageTooLongError,
} from "../../domain/Message";
import { MessageRepository } from "../MessageRepository";
import { DateProvider } from "../DateProvider";
import { Err, Ok, Result } from "../Result";

export type PostMessageCommand = {
  id: string;
  text: string;
  author: string;
};

export class PostMessageUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly dateProvider: DateProvider
  ) {}

  async handle(
    postMessageCommand: PostMessageCommand
  ): Promise<Result<void, EmptyMessageError | MessageTooLongError>> {
    let message: Message;

    try {
      message = Message.fromData({
        id: postMessageCommand.id,
        text: postMessageCommand.text,
        author: postMessageCommand.author,
        publishedAt: this.dateProvider.getNow(),
      });
    } catch (err) {
      return Err.of(err);
    }

    await this.messageRepository.save(message);

    return Ok.of(undefined);
  }
}
