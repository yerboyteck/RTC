import {
  RawSportEvent,
  SportEvent,
  SportEventStatusObj,
  AppState,
} from "../models/event";
import { logger } from "../utils/logger";
import { mapToSportEvent } from "../utils/mapper";
import { parseMappings, parseScores } from "../utils/parser";
import { SimulationService } from "./simulationService";

export class EventService {
  private state: AppState;
  private simulationService: SimulationService;
  private pollingInterval: NodeJS.Timeout | null = null;
  private readonly pollFrequency: number;

  constructor(
    simulationService: SimulationService,
    pollFrequency: number = 1000,
  ) {
    this.simulationService = simulationService;
    this.pollFrequency = pollFrequency;
    this.state = {
      events: {},
      mappings: {},
    };
  }

  getPublicState(): Record<string, SportEvent> {
    const filteredState: Record<string, SportEvent> = {};

    for (const [id, event] of Object.entries(this.state.events)) {
      if (event.status !== SportEventStatusObj.REMOVED) {
        filteredState[id] = event;
      }
    }
    return filteredState;
  }

  startPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    this.updateState();
    this.pollingInterval = setInterval(async () => {
      await this.updateState();
    }, this.pollFrequency);
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  async updateState(): Promise<void> {
    try {
      const mappingsData = await this.simulationService.getMappings();
      const eventData = await this.simulationService.getState();

      const newMappings = parseMappings(mappingsData);
      const rawEvents = eventData;

      this.state.mappings = newMappings;

      this.updateEvents(rawEvents);
    } catch (error) {
      logger.error("Error updating state", error);
    }
  }

  private updateEvents(rawEvents: RawSportEvent[]): void {
    const currentEventIds = new Set<string>();

    for (const rawEvent of rawEvents) {
      currentEventIds.add(rawEvent.id);

      const scorePeriods = parseScores(rawEvent.scores);
      const mappedEvent = mapToSportEvent(
        rawEvent,
        this.state.mappings,
        scorePeriods,
      );

      if (!mappedEvent) {
        continue;
      }

      const existingEvent = this.state.events[rawEvent.id];

      if (existingEvent) {
        if (existingEvent.status !== mappedEvent.status) {
          logger.info(
            `Status change for event ${rawEvent.id}: ${existingEvent.status} -> ${mappedEvent.status}`,
          );
        }

        for (const [periodType, score] of Object.entries(mappedEvent.scores)) {
          const existingScore =
            existingEvent.scores[
              periodType as keyof typeof existingEvent.scores
            ];
          if (!existingScore) {
            logger.info(
              `New period for event ${rawEvent.id}: ${periodType}, score ${score.home}:${score.away}`,
            );
          } else if (
            existingScore.home !== score.home ||
            existingScore.away !== score.away
          ) {
            logger.info(
              `Score change for event ${rawEvent.id}, period ${periodType}: ${existingScore.home}:${existingScore.away} -> ${score.home}:${score.away}`,
            );
          }
        }
      } else {
        logger.info(
          `New event: ${rawEvent.id}, ${mappedEvent.competitors.HOME.name} vs ${mappedEvent.competitors.AWAY.name}`,
        );
      }

      this.state.events[rawEvent.id] = mappedEvent;
    }

    for (const [id, event] of Object.entries(this.state.events)) {
      if (
        !currentEventIds.has(id) &&
        event.status !== SportEventStatusObj.REMOVED
      ) {
        logger.info(`Event ${id} marked as removed.`);
        this.state.events[id] = {
          ...event,
          status: SportEventStatusObj.REMOVED,
        };
      }
    }
  }
}
