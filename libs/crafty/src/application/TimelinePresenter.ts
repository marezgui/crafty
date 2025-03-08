import { Injectable } from '@nestjs/common';
import { Timeline } from '../domain/Timeline';

@Injectable()
export abstract class TimelinePresenter {
  abstract show(timeline: Timeline): void;
}
