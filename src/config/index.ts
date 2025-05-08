export interface AppConfig {
  port: number;
  simulationApiUrl: string;
  fetchIntervalMs: number;
}

export function getConfig(): AppConfig {
  return {
    port: parseInt(process.env.PORT || "3000", 10),
    simulationApiUrl:
      process.env.SIMULATION_API_URL || "http://localhost:8080/api",
    fetchIntervalMs: 1000,
  };
}
