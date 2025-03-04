import { Message } from "../domain/Message";

export interface MessageRepository {
  save(message: Message): Promise<void>;
  getById(messageId: string): Promise<Message>;
  getMessagesByUser(user: string): Promise<Message[]>;
}
