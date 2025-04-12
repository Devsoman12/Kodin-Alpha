import express from "express";
import { getAllNotifications, markNotificationAsRead } from "../controllers/notification.controller.js";
const router = express.Router();

router.get("/getAllNotifications", getAllNotifications);

router.post("/markNotficationAsRead", markNotificationAsRead);

export default router;