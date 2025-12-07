import { Router } from "express";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import type {
  Protocol,
  ProtocolSession,
  CreateSessionRequest,
} from "../types/protocols";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const sessionsPath = path.join(__dirname, "../data/protocol_sessions.json");
const protocolsPath = path.join(__dirname, "../data/protocols.json");

// Helper functions
async function readSessions(): Promise<ProtocolSession[]> {
  try {
    const data = await fs.readFile(sessionsPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading sessions:", error);
    return [];
  }
}

async function writeSessions(sessions: ProtocolSession[]): Promise<void> {
  try {
    await fs.writeFile(sessionsPath, JSON.stringify(sessions, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing sessions:", error);
    throw error;
  }
}

async function readProtocols(): Promise<Protocol[]> {
  try {
    const data = await fs.readFile(protocolsPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading protocols:", error);
    return [];
  }
}

async function writeProtocols(protocols: Protocol[]): Promise<void> {
  try {
    await fs.writeFile(protocolsPath, JSON.stringify(protocols, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing protocols:", error);
    throw error;
  }
}

// GET /api/protocols/:id/sessions - Get all sessions for a protocol
router.get("/:id/sessions", async (req, res) => {
  try {
    const protocolId = parseInt(req.params.id, 10);
    const sessions = await readSessions();

    const protocolSessions = sessions
      .filter(s => s.protocol_id === protocolId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json(protocolSessions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// POST /api/protocols/:id/sessions - Create a new session
router.post("/:id/sessions", async (req, res) => {
  try {
    const protocolId = parseInt(req.params.id, 10);
    const sessionData: CreateSessionRequest = req.body;

    // Validate required fields
    if (!sessionData.date || !sessionData.piece_title || !sessionData.composer) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (sessionData.subjective_progress_score < 1 || sessionData.subjective_progress_score > 5) {
      return res.status(400).json({ error: "Score must be between 1 and 5" });
    }

    // Create new session
    const newSession: ProtocolSession = {
      id: randomUUID(),
      protocol_id: protocolId,
      date: sessionData.date,
      piece_title: sessionData.piece_title,
      composer: sessionData.composer,
      duration_minutes: sessionData.duration_minutes || 0,
      subjective_progress_score: sessionData.subjective_progress_score,
      notes: sessionData.notes || "",
      next_time_hint: sessionData.next_time_hint || "",
    };

    // Save session
    const sessions = await readSessions();
    sessions.push(newSession);
    await writeSessions(sessions);

    // Update protocol
    const protocols = await readProtocols();
    const protocolIndex = protocols.findIndex(p => p.id === protocolId);

    if (protocolIndex !== -1) {
      const protocol = protocols[protocolIndex];

      // Update last_session
      protocol.last_session = sessionData.date;

      // Update status: if was not_started, move to in_progress
      if (protocol.status === "not_started") {
        protocol.status = "in_progress";
      }

      // Calculate progress based on session history
      const protocolSessions = sessions.filter(s => s.protocol_id === protocolId);
      const avgScore = protocolSessions.reduce((sum, s) => sum + s.subjective_progress_score, 0) / protocolSessions.length;

      // Progress calculation:
      // - Average score of 3 = 0.5 progress
      // - Average score of 5 = 1.0 progress (completed)
      // - Average score of 1 = 0.0 progress
      const calculatedProgress = Math.max(0, Math.min(1, (avgScore - 1) / 4));
      protocol.progress = calculatedProgress;

      // If progress is very high (>= 0.9) and has at least 5 sessions with good scores
      const goodSessions = protocolSessions.filter(s => s.subjective_progress_score >= 4).length;
      if (calculatedProgress >= 0.9 && goodSessions >= 5) {
        protocol.status = "completed";
        protocol.progress = 1;
      }

      protocols[protocolIndex] = protocol;
      await writeProtocols(protocols);
    }

    res.status(201).json(newSession);
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
});

export default router;
