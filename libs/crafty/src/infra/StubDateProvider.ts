import { DateProvider } from '../application/DateProvider';

export class StubDateProvider implements DateProvider {
  now: Date;
  getNow(): Date {
    return this.now;
  }
}
