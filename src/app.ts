import express, { Express } from "express";
import { logger } from "./utils/logger";
import { EventService } from "./services/eventService";
import { SimulationService } from "./services/simulationService";
import { EventController } from "./controllers/clientStateController";

export function createApp() {
  const simulationService = new SimulationService();
  const eventService = new EventService(simulationService);
  const eventController = new EventController(eventService);

  const app: Express = express();
  app.use(express.json());
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });
  app.get("/client/state", eventController.getState);

  return { app, eventService };
}
