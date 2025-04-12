import express from "express";
import {uploadMiddleware, uploadProfilePicture, 
        getProfilePicture,
        getBadgePictures, 
 } from "../controllers/image.controller.js";

const router = express.Router();

router.post('/upload-profile-pic', uploadMiddleware, uploadProfilePicture);
router.post("/get-profile-pic", getProfilePicture);
router.post("/getBadgePictures", getBadgePictures);

export default router;