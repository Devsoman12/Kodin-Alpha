import express from "express";
import {
    addNoteToStudent,
    addStudentToClassroom,
    assignTaskToClasses,
    createClassroom, deleteNoteFromStudent, getAllClassrooms,
    removeStudentFromClassroom,
    updateNoteForStudent,
    getClassroomInterval,
    getClassProperties,
    updateClassProperties,
    deleteClassroom,
    getAllStudents,
    getOneClass,
    getTaskAssignedToClass, getTaskIntervalForClass,
} from "../controllers/classroom.controller.js";


const router = express.Router();

router.post('/createClassroom', createClassroom);
router.post('/getClassProperties', getClassProperties);
router.post('/updateClassProperties', updateClassProperties);
router.delete('/deleteClassroom', deleteClassroom);
router.post('/addStudentToClassroom', addStudentToClassroom);
router.post('/removeStudentFromClassroom', removeStudentFromClassroom);
router.post('/addNoteToStudent', addNoteToStudent);
router.post('/deleteNoteFromStudent', deleteNoteFromStudent);
router.post('/getAllClassrooms', getAllClassrooms);
router.post('/updateNoteForStudent', updateNoteForStudent);
router.get("/interval", getClassroomInterval);

router.get("/getAllStudents", getAllStudents);
router.post("/getOneClass", getOneClass);
router.post("/getTaskAssignedToClassroom", getTaskAssignedToClass);
router.post("/addTaskToClass", assignTaskToClasses);

router.post("/getTaskIntervalForClass", getTaskIntervalForClass);


export default router;