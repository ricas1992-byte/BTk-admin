import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import protocolsRouter from "./routes/protocols";
import protocolSessionsRouter from "./routes/protocolSessions";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Protocol routes
  app.use("/api/protocols", protocolsRouter);
  app.use("/api/protocols", protocolSessionsRouter);

  return httpServer;
}
