import { Message } from "../Message";

export const messageBuilder = ({
  id = "message-id",
  author = "Author",
  text = "some-text",
  publishedAt = new Date("2025-02-23T19:00:00.000Z"),
}: Partial<Message> = {}) => {
  const props = { id, author, text, publishedAt };

  return {
    withId(_id: string) {
      return messageBuilder({
        ...props,
        id: _id,
      });
    },
    withAuthor(_author: string) {
      return messageBuilder({
        ...props,
        author: _author,
      });
    },
    withText(_text: string) {
      return messageBuilder({
        ...props,
        text: _text,
      });
    },
    publishedAt(_publishedAt: Date) {
      return messageBuilder({
        ...props,
        publishedAt: _publishedAt,
      });
    },
    build(): Message {
      return {
        ...props,
      };
    },
  };
};
