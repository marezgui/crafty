import { DateProvider } from '../application/DateProvider';

export class RealDateProvider implements DateProvider {
  getNow(): Date {
    return new Date();
  }
}
