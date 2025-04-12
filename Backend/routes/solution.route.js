import express from "express";
import { commentSolution, deleteComment, editComment, getAllComments, 
         getAllSolutions, likeOrDislikeCommentForSolution, likeSolution, submitSolution } from "../controllers/solution.controller.js";

const router = express.Router();

router.post('/submitSolution', submitSolution);
router.post('/likeSolution', likeSolution);
router.post('/getAllSolutionsForTask', getAllSolutions);
router.post('/createComment', commentSolution);
router.post('/getAllComments', getAllComments);
router.post('/deleteComment', deleteComment);
router.post('/editComment', editComment);
router.post('/likeOrDislikeComment', likeOrDislikeCommentForSolution);

export default router;