import {
  RawScore,
  RawSportEvent,
  Score,
  ScorePeriodType,
  SportEvent,
  SportEventStatus,
} from "../models/event";

const SCORE_PERIOD_TYPES: ScorePeriodType[] = [
  "CURRENT",
  "PERIOD_1",
  "PERIOD_2",
  "PERIOD_3",
  "PERIOD_4",
];

export function mapToSportEvent(
  rawEvent: RawSportEvent,
  mappings: Record<string, string>,
  scorePeriods: RawScore[],
): SportEvent | null {
  try {
    if (!hasAllRequiredMappings(rawEvent, mappings)) return null;

    return {
      id: rawEvent.id,
      status: mapStatus(rawEvent.statusId, mappings),
      scores: mapScores(scorePeriods, mappings),
      startTime: new Date(rawEvent.startTime).toISOString(),
      sport: mappings[rawEvent.sportId],
      competition: mappings[rawEvent.competitionId],
      competitors: mapCompetitors(rawEvent, mappings),
    };
  } catch (error) {
    console.error("Error mapping raw event to sport event", error);
    return null;
  }
}

function hasAllRequiredMappings(
  event: RawSportEvent,
  mappings: Record<string, string>,
): boolean {
  const requiredIds = [
    event.sportId,
    event.competitionId,
    event.homeCompetitorId,
    event.awayCompetitorId,
    event.statusId,
  ];

  for (const id of requiredIds) {
    if (!mappings[id]) {
      console.error(`Missing mapping for ID: ${id}`);
      return false;
    }
  }

  return true;
}

function mapStatus(
  id: string,
  mappings: Record<string, string>,
): SportEventStatus {
  return mappings[id] as SportEventStatus;
}

function mapCompetitors(
  event: RawSportEvent,
  mappings: Record<string, string>,
): SportEvent["competitors"] {
  return {
    HOME: {
      type: "HOME",
      name: mappings[event.homeCompetitorId],
    },
    AWAY: {
      type: "AWAY",
      name: mappings[event.awayCompetitorId],
    },
  };
}

function mapScores(
  scorePeriods: RawScore[],
  mappings: Record<string, string>,
): Partial<Record<ScorePeriodType, Score>> {
  const scores: Partial<Record<ScorePeriodType, Score>> = {};

  for (const period of scorePeriods) {
    const mappedType = mappings[period.periodTypeId];
    if (!mappedType) {
      console.warn(
        `Missing mapping for period type ID: ${period.periodTypeId}`,
      );
      continue;
    }

    if (SCORE_PERIOD_TYPES.includes(<ScorePeriodType>mappedType)) {
      scores[<ScorePeriodType>mappedType] = {
        type: <ScorePeriodType>mappedType,
        home: period.homeScore,
        away: period.awayScore,
      };
    } else {
      console.warn(`Mapped period type "${mappedType}" is not valid`);
    }
  }

  return scores;
}
