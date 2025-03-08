import { TimelinePresenter } from '@crafty/crafty/application/TimelinePresenter';
import { DefaultTimelinePresenter } from 'apps/cli/src/default.timeline.presenter';
import { Timeline } from '@crafty/crafty/domain/Timeline';
import { CustomConsoleLogger } from './custom.console.logger';

export class CliTimelinePresenter implements TimelinePresenter {
  constructor(
    private readonly defaultTimelinePresenter: DefaultTimelinePresenter,
    private readonly logger: CustomConsoleLogger,
  ) {}

  show(timeline: Timeline): void {
    console.table(this.defaultTimelinePresenter.show(timeline));
  }
}
