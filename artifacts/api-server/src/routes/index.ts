import { Router, type IRouter } from "express";
import healthRouter from "./health";
import companiesRouter from "./companies";
import recognizeRouter from "./recognize";

const router: IRouter = Router();

router.use(healthRouter);
router.use(companiesRouter);
router.use(recognizeRouter);

export default router;
