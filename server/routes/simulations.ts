import { Router, Request, Response } from "express";

import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { simulations } from "../db/schema.js";

const router = Router();

// GET all simulations
router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await db.select().from(simulations);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Failed to fetch simulations:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch simulations",
    });
  }
});

// GET simulations for a specific scenario
router.get(
  "/scenario/:scenarioId",
  async (req: Request, res: Response) => {
    try {
      const scenarioId = Number(req.params.scenarioId);

      if (!Number.isInteger(scenarioId)) {
        res.status(400).json({
          success: false,
          message: "Invalid scenarioId",
        });
        return;
      }

      const result = await db
        .select()
        .from(simulations)
        .where(eq(simulations.scenarioId, scenarioId));

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Failed to fetch scenario simulations:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch scenario simulations",
      });
    }
  }
);

// POST a new simulation
router.post("/", async (req: Request, res: Response) => {
  try {
    const { scenarioId, input, result } = req.body;

    if (!scenarioId || !input || !result) {
      res.status(400).json({
        success: false,
        message: "scenarioId, input and result are required",
      });
      return;
    }

    const [simulation] = await db
      .insert(simulations)
      .values({
        scenarioId: Number(scenarioId),
        input: String(input),
        result: String(result),
      })
      .returning();

    res.status(201).json({
      success: true,
      data: simulation,
    });
  } catch (error) {
    console.error("Failed to create simulation:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create simulation",
    });
  }
});

export default router;