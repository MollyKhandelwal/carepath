import { Router, type Request, type Response } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "CarePath API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;