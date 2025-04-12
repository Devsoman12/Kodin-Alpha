import express from "express";
import {
    updateUserBadges,
        getUserBadges,
        setUserBadge} from "../controllers/badge.controller.js";

const router = express.Router();

router.post('/setUserBadge', setUserBadge);
router.post('/updateUserBadges', updateUserBadges);
router.post('/getUserBadges', getUserBadges);

export default router;