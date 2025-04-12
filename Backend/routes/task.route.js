import express from "express";
import {
    addTask,
    addTaskToLikedTasks,
    deleteTask,
    editTask,
    getListOfTasks,
    getOneTask,
    getTasks,
    likeOrDislikeTask,
    runCode,
    verifyTask,
    getTasksByUser,
    pushTaskReportBug
} from "../controllers/task.controller.js";

const router = express.Router();

router.post('/getTasks', getTasks);
router.post('/addTask', addTask);
router.post('/getOneTask', getOneTask);
router.post('/runCode', runCode);
router.post('/editTask', editTask);
router.post('/addTaskToLikedTasks', addTaskToLikedTasks);
router.post('/likeOrDislikeTask', likeOrDislikeTask);
router.post('/verifyTask', verifyTask);
router.post('/deleteTask', deleteTask);
router.post('/getTasksByUser', getTasksByUser);
router.post('/pushTaskBugReport', pushTaskReportBug);

router.get('/getListsOfTasks', getListOfTasks)



export default router;