import express from "express";
import {addFriend, getFriends, removeFriend} from "../controllers/friendlist.controller.js";

const router = express.Router();

router.post('/addFriend', addFriend);
router.get('/getFriends', getFriends);
router.post('/removeFriend', removeFriend);

export default router;