import { Router, type IRouter } from "express";

const router: IRouter = Router();

const payload = () => ({
  status: "ok",
  service: "logomatch-ai-backend",
  timestamp: new Date().toISOString(),
});

router.get("/healthz", (_req, res) => {
  res.json(payload());
});

router.get("/health", (_req, res) => {
  res.json(payload());
});

export default router;
