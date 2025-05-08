import { describe, it, expect, vi, beforeEach } from "vitest";
import { SimulationService } from "../../src/services/simulationService";
import {
  mockApiResponse,
  mockApiMappingsResponse,
  createFetchResponse,
} from "../utils/test-utils";
import { logger } from "../../src/utils/logger";
import * as parser from "../../src/utils/parser";

vi.mock("../../src/utils/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../src/utils/parser", async () => {
  const actualModule = await vi.importActual<
    typeof import("../../src/utils/parser")
  >("../../src/utils/parser");
  return {
    ...actualModule,
    parseOdds: vi.fn(),
  };
});

describe("SimulationService", () => {
  let simulationService: SimulationService;

  beforeEach(() => {
    vi.clearAllMocks();
    simulationService = new SimulationService("http://test-api.com/api");

    vi.mocked(parser.parseOdds).mockImplementation((actualModule) => {
      return [
        {
          id: "test-id",
          sportId: "sport-1",
          competitionId: "comp-1",
          startTime: new Date().toISOString(),
          homeCompetitorId: "team-a",
          awayCompetitorId: "team-b",
          statusId: "status-1",
          scores: "period-1@1:0",
        },
      ];
    });

    global.fetch = vi.fn();
  });

  describe("getState", () => {
    it("should fetch and return parsed events", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        createFetchResponse(mockApiResponse),
      );
      const result = await simulationService.getState();

      expect(global.fetch).toHaveBeenCalledWith(
        "http://test-api.com/api/state",
      );
      expect(parser.parseOdds).toHaveBeenCalledWith(mockApiResponse.odds);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("test-id");
    });

    it("should return empty array when odds is missing", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        createFetchResponse({ odds: undefined }),
      );

      const result = await simulationService.getState();

      expect(result).toEqual([]);
    });

    it("should throw an error when fetch fails", async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Fetch failed"));
      await expect(simulationService.getState()).rejects.toThrow(
        "Fetch failed",
      );
    });

    it("should handle network errors", async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network error"));

      await expect(simulationService.getState()).rejects.toThrow(
        "Network error",
      );
    });
  });

  describe("getMappings", () => {
    it("should fetch and return mappings string", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        createFetchResponse(mockApiMappingsResponse),
      );

      const result = await simulationService.getMappings();

      expect(global.fetch).toHaveBeenCalledWith(
        "http://test-api.com/api/mappings",
      );
      expect(result).toBe(mockApiMappingsResponse.mappings);
    });

    it("should return empty string when mappings is missing", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        createFetchResponse({ mappings: undefined }),
      );

      const result = await simulationService.getMappings();

      expect(result).toBe("");
    });

    it("should return empty string and log error when fetch fails", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        createFetchResponse({}, 500),
      );

      const result = await simulationService.getMappings();

      expect(result).toBe("");
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to fetch mappings"),
        expect.anything(),
      );
    });
    it("should handle network errors", async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network error"));

      const result = await simulationService.getMappings();

      expect(result).toBe("");
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to fetch mappings"),
        expect.anything(),
      );
    });
  });
});
