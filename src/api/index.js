import express from "express";
import userStatsRouter from "./routes/userStats";
import adminStatsRouter from "./routes/adminStats";

const router = express.Router();

// Mount routes
router.use("/user", userStatsRouter);
router.use("/admin", adminStatsRouter);

export default router;
