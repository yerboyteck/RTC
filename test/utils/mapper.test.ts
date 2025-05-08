import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mapToSportEvent } from "../../src/utils/mapper";
import { mockRawEvent, mockMappings } from "./test-utils";
import { RawScore } from "../../src/models/event";

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

describe("Mappter Utils", () => {
  describe("mapToSportEvent", () => {
    it("should correctly map raw event to sport event", () => {
      const scorePeriods: RawScore[] = [
        { periodTypeId: "period-1", homeScore: "1", awayScore: "0" },
        { periodTypeId: "period-2", homeScore: "2", awayScore: "1" },
      ];

      const result = mapToSportEvent(mockRawEvent, mockMappings, scorePeriods);
      expect(result).toMatchObject({
        id: mockRawEvent.id,
        status: "LIVE",
        sport: "FOOTBALL",
        competition: "UEFA Champions League",
        competitors: {
          HOME: { type: "HOME", name: "Barcelona" },
          AWAY: { type: "AWAY", name: "Real Madrid" },
        },
        scores: {
          CURRENT: { type: "CURRENT", home: "1", away: "0" },
          PERIOD_1: { type: "PERIOD_1", home: "2", away: "1" },
        },
      });
    });
    it("should return null when missing required mappings", () => {
      const scorePeriods: RawScore[] = [
        { periodTypeId: "period-1", homeScore: "1", awayScore: "0" },
      ];

      const incompleteMappings = { ...mockMappings };
      delete incompleteMappings["sport-1"];

      const result = mapToSportEvent(
        mockRawEvent,
        incompleteMappings,
        scorePeriods,
      );
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Missing mapping for ID"),
      );
    });
    it("should handle errors during mapping", () => {
      const scorePeriods: RawScore[] = [
        { periodTypeId: "period-1", homeScore: "1", awayScore: "0" },
      ];

      const badRawEvent = {
        ...mockRawEvent,
        startTime: "invalid-date",
      };

      const result = mapToSportEvent(badRawEvent, mockMappings, scorePeriods);
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Error mapping raw event to sport event"),
        expect.any(Error),
      );
    });
    it("should handle missing score period mappings", () => {
      const scorePeriods: RawScore[] = [
        { periodTypeId: "unknown-period", homeScore: "1", awayScore: "0" },
        { periodTypeId: "period-1", homeScore: "2", awayScore: "1" },
      ];
      const result = mapToSportEvent(mockRawEvent, mockMappings, scorePeriods);

      expect(result).not.toBeNull();
      expect(result?.scores).toHaveProperty("CURRENT");
      expect(result?.scores).not.toHaveProperty("UNKNOWN_PERIOD");
    });
    it("should warn about invalid mapped period types", () => {
      const scorePeriods: RawScore[] = [
        { periodTypeId: "period-1", homeScore: "1", awayScore: "0" },
      ];

      const badMappings = {
        ...mockMappings,
        "period-1": "INVALID_TYPE",
      };

      const result = mapToSportEvent(mockRawEvent, badMappings, scorePeriods);

      expect(result).not.toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("Mapped period type"),
      );
    });
  });
});
