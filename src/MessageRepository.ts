import { Message } from "./Message";

export interface MessageRepository {
  save(message: Message): void;
  getById(messageId: string): Promise<Message>;
  getMessagesByUser(user: string): Promise<Message[]>;
}
