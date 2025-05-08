import { RawSportEvent, ApiResponse, SportEvent } from "../../src/models/event";

export const mockRawEvent: RawSportEvent = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  sportId: "sport-1",
  competitionId: "comp-1",
  startTime: new Date(1618317040000).toISOString(),
  homeCompetitorId: "team-a",
  awayCompetitorId: "team-b",
  statusId: "status-1",
  scores: "period-1@1:0|period-2@2:1",
};

export const mockMappings: Record<string, string> = {
  "sport-1": "FOOTBALL",
  "comp-1": "UEFA Champions League",
  "team-a": "Barcelona",
  "team-b": "Real Madrid",
  "status-1": "LIVE",
  "period-1": "CURRENT",
  "period-2": "PERIOD_1",
};

export const mockApiResponse: ApiResponse = {
  odds: `${mockRawEvent.id},${mockRawEvent.sportId},${mockRawEvent.competitionId},${new Date(mockRawEvent.startTime).getTime()},${mockRawEvent.homeCompetitorId},${mockRawEvent.awayCompetitorId},${mockRawEvent.statusId},${mockRawEvent.scores}\n`,
};

export const mockApiMappingsResponse: ApiResponse = {
  mappings: Object.entries(mockMappings)
    .map(([key, value]) => `${key}:${value}`)
    .join(";"),
};

export const mockSportEvent: SportEvent = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  status: "LIVE",
  scores: {
    CURRENT: {
      type: "CURRENT",
      home: "1",
      away: "0",
    },
    PERIOD_1: {
      type: "PERIOD_1",
      home: "2",
      away: "1",
    },
  },
  startTime: new Date(Number("1618317040000")).toISOString(),
  sport: "FOOTBALL",
  competition: "UEFA Champions League",
  competitors: {
    HOME: {
      type: "HOME",
      name: "Barcelona",
    },
    AWAY: {
      type: "AWAY",
      name: "Real Madrid",
    },
  },
};

export const createFetchResponse = (data: any, status = 200): Response => {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 200 ? "OK" : "ERROR",
    headers: { "Content-Type": "application/json" },
  });
};
