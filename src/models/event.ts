export interface ApiResponse {
  odds?: string;
  mappings?: string;
}

export type CompetitorType = "HOME" | "AWAY";

export const ScorePeriodTypeObj = {
  CURRENT: "CURRENT",
  PERIOD_1: "PERIOD_1",
  PERIOD_2: "PERIOD_2",
  PERIOD_3: "PERIOD_3",
  PERIOD_4: "PERIOD_4",
};

export type ScorePeriodType = keyof typeof ScorePeriodTypeObj;

export const SportEventStatusObj = {
  PRE: "PRE",
  LIVE: "LIVE",
  REMOVED: "REMOVED",
} as const;

export const CompetitorType = {
  HOME: "HOME",
  AWAY: "AWAY",
} as const;

export type SportEventStatus = keyof typeof SportEventStatusObj;

export interface Competitor {
  type: CompetitorType;
  name: string;
}

export interface Competitors {
  HOME: Competitor;
  AWAY: Competitor;
}

export interface Score {
  type: ScorePeriodType;
  home: string;
  away: string;
}

export interface SportEvent {
  id: string;
  status: SportEventStatus;
  scores: {
    [key in ScorePeriodType]?: Score;
  };
  startTime: string;
  sport: string;
  competitors: Competitors;
  competition: string;
}

export interface RawSportEvent {
  id: string;
  sportId: string;
  competitionId: string;
  startTime: string;
  homeCompetitorId: string;
  awayCompetitorId: string;
  statusId: string;
  scores: string;
}

export interface RawScore {
  periodTypeId: string;
  homeScore: string;
  awayScore: string;
}

export interface AppState {
  events: Record<string, SportEvent>;
  mappings: Record<string, string>;
}
