import { Request, Response } from "express";
import { EventService } from "../services/eventService";

export class EventController {
  private eventService: EventService;

  constructor(eventService: EventService) {
    this.eventService = eventService;
  }

  getState(req: Request, res: Response): void {
    const state = this.eventService.getPublicState();
    res.json(state);
  }
}
