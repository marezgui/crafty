import { Injectable } from '@nestjs/common';
import { EmptyMessageError, MessageTooLongError } from '../../domain/Message';
import { MessageRepository } from '../MessageRepository';
import { Err, Ok, Result } from '../Result';

export type EditMessageCommand = {
  messageId: string;
  text: string;
};

@Injectable()
export class EditMessageUseCase {
  constructor(private readonly messageRepository: MessageRepository) {}

  async handle(
    editMessageCommand: EditMessageCommand,
  ): Promise<Result<void, EmptyMessageError | MessageTooLongError>> {
    const message = await this.messageRepository.getById(
      editMessageCommand.messageId,
    );

    try {
      message.editText(editMessageCommand.text);
    } catch (err) {
      return Err.of(err);
    }

    await this.messageRepository.save(message);

    return Ok.of(undefined);
  }
}
