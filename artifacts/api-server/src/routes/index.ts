import { Router, type IRouter } from "express";
import healthRouter from "./health";
import applicationsRouter from "./applications";
import telegramRouter from "./telegram";

const router: IRouter = Router();

router.use(healthRouter);
router.use(applicationsRouter);
router.use(telegramRouter);

export default router;
