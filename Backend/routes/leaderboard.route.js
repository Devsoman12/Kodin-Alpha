import express from "express";
import { getClassroomHonor, getStats } from "../controllers/leaderboard.controller.js";

const router = express.Router();

router.get("/getUserStats", getStats);
router.post("/getClassStats", getClassroomHonor);


export default router;