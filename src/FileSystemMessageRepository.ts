import * as fs from "fs";
import * as path from "path";
import { Message } from "./Message";
import { MessageRepository } from "./MessageRepository";

export class FileSystemMessageRepository implements MessageRepository {
  save(message: Message): Promise<void> {
    return fs.promises.writeFile(
      path.join(__dirname, "message.json"),
      JSON.stringify(message)
    );
  }

  getAllUser(user: string): Promise<Message[]> {
    return Promise.resolve([]);
  }
}
