import { TimelinePresenter } from '@crafty/crafty/application/TimelinePresenter';
import { Timeline } from '@crafty/crafty/domain/Timeline';
import { FastifyReply } from 'fastify';

export class ApiTimelinePresenter implements TimelinePresenter {
  constructor(private readonly response: FastifyReply) {}

  show(timeline: Timeline) {
    this.response.status(200).send(timeline.data);
  }
}
