import express from "express";
import {login, logout, signUp, verifyCode, forgotPassword, resetPassword, checkAuth, 
        sendAgainVerificationEmail,   
        getUserProfileStats,
        updateProfile,
        deleteAccount,} from "../controllers/auth.controller.js";
import { authenticateUser } from "../middleware/authMiddleWare.js";

const router = express.Router();
router.get("/checkauth", authenticateUser, checkAuth);
router.get("/sendVerificationEmailAgain", sendAgainVerificationEmail);

router.post("/get-user-stats", getUserProfileStats);

router.put('/updateProfile', authenticateUser, updateProfile);  // Profile update endpoint
router.delete('/deleteAccount', authenticateUser, deleteAccount);  // Account deletion endpoint


router.post("/signup", signUp);
router.post('/verifycode', verifyCode);
router.post('/logout', logout);
router.post('/login', login);

router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword/:token', resetPassword);
export default router;