import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseOdds, parseMappings, parseScores } from "../../src/utils/parser";
import { mockApiMappingsResponse, mockApiResponse } from "./test-utils";
import { logger } from "../../src/utils/logger";

vi.mock("../../src/utils/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Parser Utils", () => {
  beforeEach(() => {
    vi.clearAllMocks;
  });

  describe("parseOdds", () => {
    it("should correctly parse odds data into RawSportEvent array", () => {
      const odds = <string>mockApiResponse.odds;
      const result = parseOdds(odds);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "123e4567-e89b-12d3-a456-426614174000",
        sportId: "sport-1",
        competitionId: "comp-1",
        homeCompetitorId: "team-a",
        awayCompetitorId: "team-b",
        statusId: "status-1",
        scores: "period-1@1:0|period-2@2:1",
      });

      expect(result[0].startTime).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
      );
    });

    it("should handle empty odds string", () => {
      const result = parseOdds("");
      expect(result).toEqual([]);
    });

    it("should log and skip invalid event data", () => {
      const invalidOdds = "invalid-data\n123,456,789\n";
      const result = parseOdds(invalidOdds);

      expect(result).toHaveLength(0);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Invalid event data format"),
      );
    });

    it("should handle multiple events", () => {
      const multipleEvents = `${mockApiResponse.odds}${mockApiResponse.odds}`;
      const result = parseOdds(multipleEvents);

      expect(result).toHaveLength(2);
    });
  });

  describe("parseMappings", () => {
    it("should correctly parse mappings string into object", () => {
      const mappings = <string>mockApiMappingsResponse.mappings;
      const result = parseMappings(mappings);

      expect(result).toEqual({
        "sport-1": "FOOTBALL",
        "comp-1": "UEFA Champions League",
        "team-a": "Barcelona",
        "team-b": "Real Madrid",
        "status-1": "LIVE",
        "period-1": "CURRENT",
        "period-2": "PERIOD_1",
      });
    });

    it("should handle empty mappings string", () => {
      const result = parseMappings("");
      expect(result).toEqual({});
    });

    it("should handle malformed mappings", () => {
      const malformedMappings = "key1:value1;key2value2;key3:value3";
      const result = parseMappings(malformedMappings);

      expect(result).toEqual({
        key1: "value1",
        key3: "value3",
      });
    });
  });

  describe("parseScores", () => {
    it("should correctly parse scores string into RawScore array", () => {
      const scores = "period-1@1:0|period-2@2:1";
      const result = parseScores(scores);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        periodTypeId: "period-1",
        homeScore: "1",
        awayScore: "0",
      });
      expect(result[1]).toEqual({
        periodTypeId: "period-2",
        homeScore: "2",
        awayScore: "1",
      });
    });
    it("should handle empty scores string", () => {
      const result = parseScores("");
      expect(result).toEqual([]);
    });
  });
});
