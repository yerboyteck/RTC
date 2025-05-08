import { RawSportEvent, ApiResponse } from "../models/event";
import { logger } from "../utils/logger";
import { parseOdds } from "../utils/parser";

export class SimulationService {
  private readonly apiBaseUrl: string;

  constructor(apiBaseUrl?: string) {
    if (apiBaseUrl) {
      this.apiBaseUrl = apiBaseUrl;
      logger.info(
        `SimulationService initialized with custom API URL: ${apiBaseUrl}`,
      );
      return;
    }
    const host = process.env.SIMULATION_HOST || "localhost";
    const port = process.env.SIMULATION_PORT || "3000";
    this.apiBaseUrl = `http://${host}:${port}/api`;
    logger.info(
      `SimulationService initialized with API URL: ${this.apiBaseUrl}`,
    );
  }

  async getState(): Promise<RawSportEvent[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/state`);
      if (!response.ok) {
        throw new Error(`Error fetching state: ${response.statusText}`);
      }
      const data: ApiResponse = await response.json();
      const { odds } = data;

      if (!odds) {
        return [];
      }
      return parseOdds(odds);
    } catch (error) {
      console.error("Error fetching state", error);
      throw error;
    }
  }

  async getMappings() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/mappings`);
      if (!response.ok) {
        throw new Error(`Error fetching mappings: ${response.statusText}`);
      }
      const data: ApiResponse = await response.json();
      const { mappings } = data;

      return mappings ?? "";
    } catch (error) {
      logger.error("Failed to fetch mappings", error);
      return "";
    }
  }
}
