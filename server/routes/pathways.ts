import { Router } from "express";

import { db } from "../db/index.js";
import { pathways } from "../db/schema.js";

const router = Router();

// GET all pathways
router.get("/", async (req, res) => {
  try {
    const result = await db.select().from(pathways);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Failed to fetch pathways:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch pathways",
    });
  }
});

// POST a new pathway
router.post("/", async (req, res) => {
  try {
    const {
      scenarioId,
      hospital,
      roomType,
      estimatedCost,
      coverageFit,
      baseline,
    } = req.body;

    if (
      !scenarioId ||
      !hospital ||
      !roomType ||
      !estimatedCost ||
      !coverageFit
    ) {
      return res.status(400).json({
        success: false,
        message:
          "scenarioId, hospital, roomType, estimatedCost and coverageFit are required",
      });
    }

    const [pathway] = await db
      .insert(pathways)
      .values({
        scenarioId,
        hospital,
        roomType,
        estimatedCost,
        coverageFit,
        baseline: baseline ?? true,
      })
      .returning();

    res.status(201).json({
      success: true,
      data: pathway,
    });
  } catch (error) {
    console.error("Failed to create pathway:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create pathway",
    });
  }
});

export default router;