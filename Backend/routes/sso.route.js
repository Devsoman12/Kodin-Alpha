import express from "express";
import { ssoLogin, ssoCallback } from "../controllers/sso.controller.js";

const router = express.Router();

router.get("/login", ssoLogin);
router.get("/callback", ssoCallback);

export default router;
