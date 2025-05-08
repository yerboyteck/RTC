import { RawScore, RawSportEvent } from "../models/event";
import { logger } from "./logger";

export function parseOdds(odds: string): RawSportEvent[] {
  const events = odds.split("\n").filter(Boolean);

  return events.reduce<RawSportEvent[]>((acc, event) => {
    const parts = event.split(",");

    if (parts.length < 8) {
      logger.info(`Invalid event data format: ${event}`);
      return acc;
    }

    acc.push({
      id: parts[0],
      sportId: parts[1],
      competitionId: parts[2],
      startTime: new Date(Number(parts[3])).toISOString(),
      homeCompetitorId: parts[4],
      awayCompetitorId: parts[5],
      statusId: parts[6],
      scores: parts[7],
    });

    return acc;
  }, []);
}

export function parseMappings(mappings: string): Record<string, string> {
  const result: Record<string, string> = {};
  const mappingPairs = mappings.split(";");

  mappingPairs.forEach((pair) => {
    const [id, value] = pair.split(":");
    if (id && value) {
      result[id] = value;
    }
  });
  return result;
}

export function parseScores(scoresData: string): RawScore[] {
  if (!scoresData) {
    return [];
  }

  const scorePeriods = scoresData.split("|");
  return scorePeriods.map((period) => {
    const [periodWithType, score] = period.split("@");
    const [homeScore, awayScore] = score.split(":");

    return {
      periodTypeId: periodWithType,
      homeScore,
      awayScore,
    };
  });
}
