import { Message } from "./Message";

export interface MessageRepository {
  save(message: Message): void;
  getMessagesByUser(user: string): Promise<Message[]>;
}
