import { Router } from "express";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type {
  Protocol,
  ProtocolSummary,
  UpdateProtocolStatusRequest,
  UpdateProtocolMetaRequest,
  BasicSessionRequest,
} from "../types/protocols";

const router = Router();
const protocolsPath = path.join(process.cwd(), "server/data/protocols.json");

// Helper functions for reading/writing protocols
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

// GET /api/protocols - Get all protocols
router.get("/", async (req, res) => {
  try {
    const protocols = await readProtocols();
    res.json(protocols);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch protocols" });
  }
});

// GET /api/protocols/summary - Get summary statistics
router.get("/summary", async (req, res) => {
  try {
    const protocols = await readProtocols();

    // Filter only approved and active protocols
    const activeProtocols = protocols.filter(
      p => p.design_status === "approved" && p.is_active_for_practice
    );

    const summary: ProtocolSummary = {
      total: activeProtocols.length,
      not_started: activeProtocols.filter(p => p.status === "not_started").length,
      in_progress: activeProtocols.filter(p => p.status === "in_progress").length,
      completed: activeProtocols.filter(p => p.status === "completed").length,
      average_progress: activeProtocols.length > 0
        ? activeProtocols.reduce((sum, p) => sum + p.progress, 0) / activeProtocols.length
        : 0,
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch protocol summary" });
  }
});

// GET /api/protocols/:id - Get a specific protocol
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const protocols = await readProtocols();
    const protocol = protocols.find(p => p.id === id);

    if (!protocol) {
      return res.status(404).json({ error: "Protocol not found" });
    }

    res.json(protocol);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch protocol" });
  }
});

// PUT /api/protocols/:id/status - Update protocol status/progress
router.put("/:id/status", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updates: UpdateProtocolStatusRequest = req.body;

    const protocols = await readProtocols();
    const protocolIndex = protocols.findIndex(p => p.id === id);

    if (protocolIndex === -1) {
      return res.status(404).json({ error: "Protocol not found" });
    }

    const protocol = protocols[protocolIndex];

    // Apply updates
    if (updates.status !== undefined) {
      protocol.status = updates.status;
    }
    if (updates.progress !== undefined) {
      protocol.progress = Math.max(0, Math.min(1, updates.progress));
    }
    if (updates.notes !== undefined) {
      protocol.notes = updates.notes;
    }
    if (updates.next_focus !== undefined) {
      protocol.next_focus = updates.next_focus;
    }

    protocols[protocolIndex] = protocol;
    await writeProtocols(protocols);

    res.json(protocol);
  } catch (error) {
    res.status(500).json({ error: "Failed to update protocol" });
  }
});

// GET /api/protocols/meta - Get all protocols with admin fields
router.get("/meta", async (req, res) => {
  try {
    const protocols = await readProtocols();
    res.json(protocols);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch protocols metadata" });
  }
});

// PUT /api/protocols/meta - Update protocols admin fields
router.put("/meta", async (req, res) => {
  try {
    const updates: Array<{ id: number } & UpdateProtocolMetaRequest> = req.body;
    const protocols = await readProtocols();

    for (const update of updates) {
      const protocolIndex = protocols.findIndex(p => p.id === update.id);
      if (protocolIndex !== -1) {
        const protocol = protocols[protocolIndex];

        if (update.name !== undefined) {
          protocol.name = update.name;
        }
        if (update.design_status !== undefined) {
          protocol.design_status = update.design_status;
        }
        if (update.is_active_for_practice !== undefined) {
          protocol.is_active_for_practice = update.is_active_for_practice;
        }
        if (update.admin_notes !== undefined) {
          protocol.admin_notes = update.admin_notes;
        }

        protocols[protocolIndex] = protocol;
      }
    }

    await writeProtocols(protocols);
    res.json(protocols);
  } catch (error) {
    res.status(500).json({ error: "Failed to update protocols metadata" });
  }
});

// POST /api/protocols/:id/sessions/basic - Create a basic session
router.post("/:id/sessions/basic", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const sessionData: BasicSessionRequest = req.body;

    const protocols = await readProtocols();
    const protocolIndex = protocols.findIndex(p => p.id === id);

    if (protocolIndex === -1) {
      return res.status(404).json({ error: "Protocol not found" });
    }

    const protocol = protocols[protocolIndex];

    // Update protocol status
    protocol.status = sessionData.status_after_session;
    protocol.last_session = sessionData.date;

    // Update progress based on status
    if (sessionData.status_after_session === "completed") {
      protocol.progress = 1;
    } else if (sessionData.status_after_session === "in_progress" && protocol.progress === 0) {
      protocol.progress = 0.1; // Initial progress
    }

    protocols[protocolIndex] = protocol;
    await writeProtocols(protocols);

    // Store the basic session (simplified version)
    const sessionsPath = path.join(process.cwd(), "server/data/protocol_sessions.json");
    let sessions = [];
    try {
      const sessionsData = await fs.readFile(sessionsPath, "utf-8");
      sessions = JSON.parse(sessionsData);
    } catch (error) {
      // File doesn't exist yet, start with empty array
    }

    const newSession = {
      id: uuidv4(),
      protocol_id: id,
      date: sessionData.date,
      piece_title: sessionData.piece_title,
      composer: "",
      duration_minutes: sessionData.duration_minutes,
      subjective_progress_score: 0, // Not used in basic session
      notes: sessionData.notes,
      next_time_hint: "",
    };

    sessions.push(newSession);
    await fs.writeFile(sessionsPath, JSON.stringify(sessions, null, 2), "utf-8");

    res.json({ protocol, session: newSession });
  } catch (error) {
    console.error("Error creating basic session:", error);
    res.status(500).json({ error: "Failed to create basic session" });
  }
});

export default router;
