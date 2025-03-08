import { Injectable } from '@nestjs/common';
import { Message } from '../domain/Message';

@Injectable()
export abstract class MessageRepository {
  abstract save(message: Message): Promise<void>;
  abstract getById(messageId: string): Promise<Message>;
  abstract getMessagesByUser(user: string): Promise<Message[]>;
}
