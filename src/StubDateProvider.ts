import { DateProvider } from "./PostMessageUseCase";

export class StubDateProvider implements DateProvider {
  now: Date;
  getNow(): Date {
    return this.now;
  }
}
