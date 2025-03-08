import { Timeline } from "../domain/Timeline";

export interface TimelinePresenter {
  show(timeline: Timeline): void;
}
