import { Message } from "./Message";

export interface MessageRepository {
  save(message: Message): void;
  getAllUser(user: string): Promise<Message[]>;
}
