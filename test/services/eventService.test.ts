import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventService } from "../../src/services/eventService";
import { SimulationService } from "../../src/services/simulationService";
import {
  mockRawEvent,
  mockMappings,
  mockSportEvent,
} from "../utils/test-utils";
import { logger } from "../../src/utils/logger";
import * as parser from "../../src/utils/parser";
import * as mapper from "../../src/utils/mapper";
import { ScorePeriodType, SportEventStatusObj } from "../../src/models/event";

vi.mock("../../src/utils/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../src/utils/parser", () => ({
  parseMappings: vi.fn(),
  parseScores: vi.fn(),
}));

vi.mock("../../src/utils/mapper", () => ({
  mapToSportEvent: vi.fn(),
}));

describe("EventService", () => {
  let eventService: EventService;
  let mockSimulationService: SimulationService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockSimulationService = {
      getState: vi.fn().mockResolvedValue([mockRawEvent]),
      getMappings: vi.fn().mockResolvedValue("mappings-string"),
    } as unknown as SimulationService;

    vi.mocked(parser.parseMappings).mockReturnValue(mockMappings);
    vi.mocked(parser.parseScores).mockReturnValue([
      { periodTypeId: "period-1", homeScore: "1", awayScore: "0" },
    ]);

    vi.mocked(mapper.mapToSportEvent).mockReturnValue({ ...mockSportEvent });

    eventService = new EventService(mockSimulationService, 1000);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("getPublicState", () => {
    it("should return events with non-REMOVED status", async () => {
      await eventService.updateState();
      const removedEvent = {
        ...mockSportEvent,
        id: "removed-id",
        status: SportEventStatusObj.REMOVED,
      };
      Object.defineProperty(eventService, "state", {
        value: {
          events: {
            [mockSportEvent.id]: mockSportEvent,
            "removed-id": removedEvent,
          },
          mappings: mockMappings,
        },
        writable: true,
      });

      const result = eventService.getPublicState();
      expect(Object.keys(result)).toHaveLength(1);
      expect(result).toHaveProperty(mockSportEvent.id);
      expect(result).not.toHaveProperty("removed-id");
    });
  });

  describe("startPolling", () => {
    it("should start polling at specified interval", async () => {
      const updateStateSpy = vi.spyOn(eventService, "updateState");

      eventService.startPolling();
      expect(updateStateSpy).toHaveBeenCalledOnce();

      await vi.advanceTimersByTimeAsync(1000);
      expect(updateStateSpy).toHaveBeenCalledTimes(2);

      await vi.advanceTimersByTimeAsync(1000);
      expect(updateStateSpy).toHaveBeenCalledTimes(3);

      eventService.stopPolling();
    });

    it("should clear existing interval when starting new polling", () => {
      const clearIntervalSpy = vi.spyOn(global, "clearInterval");

      eventService.startPolling();
      eventService.startPolling();

      expect(clearIntervalSpy).toHaveBeenCalledOnce();
    });
  });

  describe("stopPolling", () => {
    it("should clear polling interval", () => {
      const clearIntervalSpy = vi.spyOn(global, "clearInterval");

      eventService.startPolling();
      eventService.stopPolling();

      expect(clearIntervalSpy).toHaveBeenCalledOnce();
    });

    it("should do nothing if no polling is active", () => {
      const clearIntervalSpy = vi.spyOn(global, "clearInterval");

      eventService.stopPolling();

      expect(clearIntervalSpy).not.toHaveBeenCalled();
    });
  });

  describe("updateState", () => {
    it("should fetch and update mappings and events", async () => {
      await eventService.updateState();
      expect(mockSimulationService.getMappings).toHaveBeenCalledOnce();
      expect(mockSimulationService.getState).toHaveBeenCalledOnce();
      expect(parser.parseMappings).toHaveBeenCalledWith("mappings-string");
      expect(parser.parseScores).toHaveBeenCalledWith(mockRawEvent.scores);
      expect(mapper.mapToSportEvent).toHaveBeenCalledOnce();

      const state = Object.getOwnPropertyDescriptor(
        eventService,
        "state",
      )?.value;
      expect(state.mappings).toEqual(mockMappings);
      expect(state.events).toHaveProperty(mockSportEvent.id);
    });

    it("should handle and log errors", async () => {
      const error = new Error("Test error");
      mockSimulationService.getMappings = vi.fn().mockRejectedValue(error);

      await eventService.updateState();

      expect(logger.error).toHaveBeenCalledWith("Error updating state", error);
    });

    it("should log status changes", async () => {
      await eventService.updateState();

      const updatedEvent = {
        ...mockSportEvent,
        status: SportEventStatusObj.REMOVED,
      };
      vi.mocked(mapper.mapToSportEvent).mockReturnValue(updatedEvent);

      await eventService.updateState();

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining(
          `Status change for event ${mockSportEvent.id}: ${mockSportEvent.status} -> ${updatedEvent.status}`,
        ),
      );
    });

    it("should log score changes", async () => {
      await eventService.updateState();

      const updatedEvent = {
        ...mockSportEvent,
        scores: {
          CURRENT: {
            type: <ScorePeriodType>"CURRENT",
            home: "2",
            away: "0",
          },
        },
      };
      vi.mocked(mapper.mapToSportEvent).mockReturnValue(updatedEvent);

      await eventService.updateState();

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Score change for event"),
      );
    });
    it("should mark missing events as removed", async () => {
      await eventService.updateState();

      mockSimulationService.getState = vi.fn().mockResolvedValue([]);

      await eventService.updateState();

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining(
          `Event ${mockSportEvent.id} marked as removed.`,
        ),
      );

      const state = Object.getOwnPropertyDescriptor(
        eventService,
        "state",
      )?.value;
      expect(state.events[mockSportEvent.id].status).toBe(
        SportEventStatusObj.REMOVED,
      );
    });
  });
});
