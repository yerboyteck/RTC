import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventController } from "../../src/controllers/clientStateController";
import { EventService } from "../../src/services/eventService";
import { mockSportEvent } from "../utils/test-utils";
import { Request, Response } from "express";

describe("EventController", () => {
  let eventController: EventController;
  let mockEventService: EventService;
  let mockRequest: Request;
  let mockResponse: Response;

  beforeEach(() => {
    mockEventService = {
      getPublicState: vi.fn().mockReturnValue({
        [mockSportEvent.id]: mockSportEvent,
      }),
    } as unknown as EventService;

    eventController = new EventController(mockEventService);

    mockResponse = {
      json: vi.fn(),
    } as unknown as Response;

    mockRequest = {} as Request;
  });

  describe("getState", () => {
    it("should return public state from event service", () => {
      eventController.getState(mockRequest, mockResponse);

      expect(mockEventService.getPublicState).toHaveBeenCalledOnce();

      expect(mockResponse.json).toHaveBeenCalledWith({
        [mockSportEvent.id]: mockSportEvent,
      });
    });

    it("should handle empty state", () => {
      mockEventService.getPublicState = vi.fn().mockReturnValue({});

      eventController.getState(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith({});
    });

    it("should bind this context correctly", () => {
      const getState = eventController.getState.bind(eventController);
      getState(mockRequest, mockResponse);

      expect(mockEventService.getPublicState).toHaveBeenCalledOnce();
    });
  });
});
