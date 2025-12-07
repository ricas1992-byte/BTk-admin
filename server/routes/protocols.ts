import { Router } from "express";
import { promises as fs } from "fs";
import path from "path";
import type {
  Protocol,
  ProtocolSummary,
  UpdateProtocolStatusRequest,
} from "../types/protocols";

const router = Router();
const protocolsPath = path.join(__dirname, "../data/protocols.json");

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

    const summary: ProtocolSummary = {
      total: protocols.length,
      not_started: protocols.filter(p => p.status === "not_started").length,
      in_progress: protocols.filter(p => p.status === "in_progress").length,
      completed: protocols.filter(p => p.status === "completed").length,
      average_progress: protocols.length > 0
        ? protocols.reduce((sum, p) => sum + p.progress, 0) / protocols.length
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

export default router;
