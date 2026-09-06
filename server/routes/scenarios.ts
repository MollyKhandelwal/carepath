import { Router } from "express";

import { db } from "../db/index.js";
import { scenarios } from "../db/schema.js";

const router = Router();

// GET all scenarios
router.get("/", async (req, res) => {
  try {
    const result = await db.select().from(scenarios);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Failed to fetch scenarios:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch scenarios",
    });
  }
});

// POST a new scenario
router.post("/", async (req, res) => {
  try {
    const { name, location, careStage, status } = req.body;

    if (!name || !location || !careStage) {
      return res.status(400).json({
        success: false,
        message: "name, location and careStage are required",
      });
    }

    const [scenario] = await db
      .insert(scenarios)
      .values({
        name,
        location,
        careStage,
        status: status || "feasible",
      })
      .returning();

    res.status(201).json({
      success: true,
      data: scenario,
    });
  } catch (error) {
    console.error("Failed to create scenario:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create scenario",
    });
  }
});

export default router;