import pool from "../db/connectDB.js"; // Import the database connection pool
import { assignTaskToClassrooms } from "../utils/assignTaskToClassrooms.js";
import { decodeToken } from "../utils/decodeToken.js";
import { createLog } from "../utils/createLog.js";

export const updateClassProperties = async (req, res) => {
    const { classroom_id, class_name, class_subject } = req.body;
    const userID = req.userID || null; // Assumes authentication middleware sets req.userID
  
    if (!classroom_id || !class_name || !class_subject) {
      const logMessage = `Failed updateClassProperties: Missing fields`;
      await createLog(userID, classroom_id, null, null, logMessage, false);
      return res.status(400).json({
        status: "false",
        message: "Missing required fields (classroom_id, class_name, or class_subject)",
      });
    }
  
    try {
      const query = `
        UPDATE classroom
        SET name = $1, subject = $2
        WHERE classroom_id = $3
        RETURNING classroom_id, name, subject;
      `;
  
      const result = await pool.query(query, [class_name, class_subject, classroom_id]);
  
      if (result.rows.length === 0) {
        const logMessage = `Classroom not found during update (ID: ${classroom_id})`;
        await createLog(userID, classroom_id, null, null, logMessage, false);
        return res.status(404).json({ status: "false", message: "Classroom not found." });
      }
  
      const updatedClass = result.rows[0];
      const logMessage = `Classroom updated: ID ${classroom_id}, Name: ${class_name}, Subject: ${class_subject}`;
      await createLog(userID, classroom_id, null, null, logMessage, true);
  
      res.status(200).json({
        status: "success",
        message: "Class properties updated successfully.",
        data: {
          class_name: updatedClass.name,
          class_subject: updatedClass.subject,
        },
      });
    } catch (error) {
      const logMessage = `Error while updating classroom properties: ${error.message}`;
      await createLog(userID, classroom_id, null, null, logMessage, false);
      res.status(500).json({
        status: "false",
        message: "Failed to update classroom properties",
        error: error.message,
      });
    }
  };

export const getClassProperties = async (req, res) => {
    const { classroom_id } = req.body;
    const userID = req.userID || null; // Optional user tracking
  
    if (!classroom_id) {
      await createLog(userID, classroom_id, null, null, "getClassProperties failed: Missing classroom_id", false);
      return res.status(400).json({ status: "false", message: "Missing classroom ID" });
    }
  
    try {
      const query = `
        SELECT c.name, c.subject, u.nick AS teacher_name
        FROM classroom c
        JOIN userr u ON c.user_id = u.user_id
        WHERE c.classroom_id = $1;
      `;
  
      const result = await pool.query(query, [classroom_id]);
  
      if (result.rows.length === 0) {
        await createLog(userID, classroom_id, null, null, `getClassProperties: Classroom not found (ID: ${classroom_id})`, false);
        return res.status(404).json({ status: "false", message: "Classroom not found." });
      }
  
      const { name, subject, teacher_name } = result.rows[0];
  
      await createLog(userID, classroom_id, null, null, `getClassProperties OK: Classroom ID ${classroom_id} fetched`, true);
  
      res.status(200).json({
        status: "success",
        message: "Class properties retrieved successfully.",
        data: {
          class_name: name,
          class_subject: subject,
          teacher_name: teacher_name,
        },
      });
    } catch (error) {
      await createLog(userID, classroom_id, null, null, `Error in getClassProperties: ${error.message}`, false);
      res.status(500).json({
        status: "false",
        message: "Failed to retrieve classroom properties",
        error: error.message,
      });
    }
};

export const createClassroom = async (req, res) => {
  const {
    name,
    subject,
    start_time,
    end_time,
    day_of_week,
    user_id,
  } = req.body;

  if (!name || !start_time || !end_time || !user_id || !day_of_week || !subject) {
    await createLog(user_id, null, null, null, "createClassroom failed: Missing required fields", false);
    return res.status(400).json({ status: "false", message: "Missing required fields" });
  }

  try {
    const authorQuery = `SELECT user_id FROM userr WHERE user_id = $1`;
    const result = await pool.query(authorQuery, [user_id]);

    if (result.rows.length === 0) {
      await createLog(user_id, null, null, null, "createClassroom failed: User not found in DB", false);
      return res.status(404).json({ status: "false", message: "User not found in the database." });
    }

    const timeQuery = `
      SELECT * FROM classroom 
      WHERE day_of_week = $3 AND user_id = $4
      AND NOT (end_time <= $1 OR start_time >= $2)
    `;
    const timeResult = await pool.query(timeQuery, [start_time, end_time, day_of_week, user_id]);

    if (timeResult.rows.length > 0) {
      await createLog(user_id, null, null, null, "createClassroom failed: Time conflict with existing class", false);
      return res.status(400).json({ status: "false", message: "Time frame already occupied by another class." });
    }

    const addClassQuery = `
      INSERT INTO classroom (name, subject, start_time, end_time, day_of_week, user_id)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING classroom_id`;
    const insertResult = await pool.query(addClassQuery, [name, subject, start_time, end_time, day_of_week, user_id]);

    const classroomId = insertResult.rows[0].classroom_id;

    const taskListQuery = `
      INSERT INTO listOfTask (name, user_id) 
      VALUES ('Classroom Tasks', $1) RETURNING list_id`;
    const taskListResult = await pool.query(taskListQuery, [user_id]);

    const listId = taskListResult.rows[0].list_id;

    await pool.query(
      `INSERT INTO classroommlistoftasks (list_id, classroom_id) VALUES ($1, $2)`,
      [listId, classroomId]
    );

    await createLog(user_id, classroomId, null, null, `createClassroom OK: Classroom ${classroomId} created`, true);

    res.status(200).json({
      status: "success",
      message: "Classroom created successfully with an empty task list.",
      classroom_id: classroomId,
      list_id: listId,
    });

  } catch (error) {
    await createLog(user_id, classroomId, null, null, `Error in createClassroom: ${error.message}`, false);
    res.status(500).json({
      status: "false",
      message: "Classroom creation failed",
      error: error.message
    });
  }
};

export const deleteClassroom = async (req, res) => {
  const { classroom_id } = req.query;

  if (!classroom_id) {
    await createLog(null, classroom_id, null, null, "deleteClassroom failed: Missing classroom_id", false);
    return res.status(400).json({ status: "false", message: "Missing classroom_id" });
  }

  try {
    const checkQuery = `SELECT user_id FROM classroom WHERE classroom_id = $1`;
    const checkResult = await pool.query(checkQuery, [classroom_id]);

    if (checkResult.rows.length === 0) {
      await createLog(null, classroom_id, null, null, `deleteClassroom failed: Classroom ${classroom_id} not found`, false);
      return res.status(404).json({ status: "false", message: "Classroom not found." });
    }

    const user_id = checkResult.rows[0].user_id;

    const removeClassroomTaskQuery = `DELETE FROM classroomtask WHERE classroom_id = $1`;
    await pool.query(removeClassroomTaskQuery, [classroom_id]);

    const removeNotesQuery = `DELETE FROM note WHERE classroom_id = $1`;
    await pool.query(removeNotesQuery, [classroom_id]);

    const removeStudentsQuery = `DELETE FROM ispartof WHERE classroom_id = $1`;
    await pool.query(removeStudentsQuery, [classroom_id]);

    const deleteQuery = `DELETE FROM classroom WHERE classroom_id = $1`;
    await pool.query(deleteQuery, [classroom_id]);

    await createLog(user_id, classroom_id, null, null, `deleteClassroom OK: Classroom ${classroom_id} deleted`, true);

    res.status(200).json({
      status: "success",
      message: "Classroom deleted successfully.",
    });
  } catch (error) {
    await createLog(null, classroom_id, null, null, `Error in deleteClassroom: ${error.message}`, false);
    res.status(500).json({
      status: "false",
      message: "Classroom deletion failed",
      error: error.message
    });
  }
};

export const getAllClassrooms = async (req, res) => {
  const { userID } = await decodeToken(req);
  const { task_id } = req.body;

  try {
    let classroomsQuery;
    let queryParams = [userID];

    if (task_id) {
      classroomsQuery = `
        SELECT 
            c.classroom_id AS id, 
            c.name AS name, 
            c.start_time, 
            c.end_time,
            c.day_of_week,
            u.nick AS teacher_name,
            CASE 
                WHEN ct.task_id IS NOT NULL THEN true 
                ELSE false 
            END AS "hasTask"
        FROM classroom c
        JOIN userR u ON c.user_id = u.user_id
        LEFT JOIN classroomtask ct ON c.classroom_id = ct.classroom_id AND ct.task_id = $2
        WHERE c.user_id = $1;
      `;
      queryParams.push(task_id);
    } else {
      classroomsQuery = `
        SELECT 
            c.classroom_id AS id, 
            c.name AS name, 
            c.start_time, 
            c.end_time,
            c.day_of_week,
            u.nick AS teacher_name
        FROM classroom c
        JOIN userR u ON c.user_id = u.user_id
        WHERE c.user_id = $1
        OR c.classroom_id IN (SELECT classroom_id FROM isPartOf WHERE user_id = $1);
      `;
    }

    const classroomsResult = await pool.query(classroomsQuery, queryParams);

    if (classroomsResult.rows.length === 0) {
      await createLog(userID, null, null, null, "getAllClassrooms result: No classrooms found", false);
      return res.status(200).json({ status: "false", message: "No classrooms found." });
    }

    await createLog(userID, null, null, null, "getAllClassrooms OK: classrooms fetched", true);

    res.status(200).json({
      status: "success",
      message: "List of classrooms retrieved successfully.",
      result: classroomsResult.rows
    });

  } catch (error) {
    await createLog(userID, null, null, null, `Error in getAllClassrooms: ${error.message}`, false);
    res.status(500).json({
      status: "false",
      message: "Fetching classrooms failed",
      error: error.message
    });
  }
};

export const addStudentToClassroom = async (req, res) => {

    const {
        user_id,
        classroom_id
    } = req.body;

    // console.log(user_id);
    // console.log("classid:", classroom_id);

    if (!user_id || !classroom_id) {
        await createLog(user_id, classroom_id, null, null, "addStudentToClassroom: Missing required fields", false);
        return res.status(400).json({ status: "false", message: "Missing required fields" });
    }

    try {
        const userIDQuery = `SELECT * FROM userr WHERE user_id = $1`;
        const userIDResult = await pool.query(userIDQuery, [user_id]);

        if (userIDResult.rows.length <= 0) {
            await createLog(user_id, classroom_id, null, null, "addStudentToClassroom: User not found", false);
            return res.status(400).json({ status: "false", message: "No user with the corresponding ID found in the database." });
        }

        const classroomIDQuery = 'SELECT * FROM classroom WHERE classroom_id = $1';
        const classroomIDResult = await pool.query(classroomIDQuery, [classroom_id]);

        if (classroomIDResult.rows.length <= 0) {
            await createLog(user_id, classroom_id, null, null, "addStudentToClassroom: Classroom not found", false);
            return res.status(400).json({ status: "false", message: "No classroom with the corresponding ID found in the database." });
        }

        const studentAlreadyInClassroomQuery = `SELECT * FROM ispartof WHERE user_id = $1 AND classroom_id = $2`;
        const studentAlreadyInClassroomResult = await pool.query(studentAlreadyInClassroomQuery, [user_id, classroom_id]);

        if (studentAlreadyInClassroomResult.rows.length > 0) {
            await createLog(user_id, classroom_id, null, null, "addStudentToClassroom: Student already assigned to classroom", false);
            return res.status(404).json({ status: "false", message: "Student has already been assigned to this classroom." });
        }

        const addStudentToClassroomQuery = `
            INSERT INTO ispartof (user_id, classroom_id)
            VALUES ($1, $2)
        `;
        await pool.query(addStudentToClassroomQuery, [user_id, classroom_id]);

        await createLog(user_id, classroom_id, null, null, `addStudentToClassroom OK: User added to classroom ${classroom_id}`, true);

        res.status(200).json({
            status: "success",
            message: "Student was assigned to classroom successfully.",
        });

    } catch (error) {
        await createLog(user_id, classroom_id, null, null, `Error in addStudentToClassroom: ${error.message}`, false);
        res.status(500).json({ status: "false", message: "Adding student to classroom failed", error: error.message });
    }
};

export const removeStudentFromClassroom = async (req, res) => {
    const {
        user_id,
        classroom_id
    } = req.body;

    if (!user_id || !classroom_id) {
        await createLog(user_id, classroom_id, null, null, "removeStudentFromClassroom: Missing required fields", false);
        return res.status(400).json({ status: "false", message: "Missing required fields" });
    }

    try {
        const userIDQuery = `SELECT * FROM userr WHERE user_id = $1`;
        const userIDResult = await pool.query(userIDQuery, [user_id]);

        if (userIDResult.rows.length <= 0) {
            await createLog(user_id, classroom_id, null, null, "removeStudentFromClassroom: User not found", false);
            return res.status(400).json({ status: "false", message: "No user with the corresponding ID found in the database." });
        }

        const classroomIDQuery = 'SELECT * FROM classroom WHERE classroom_id = $1';
        const classroomIDResult = await pool.query(classroomIDQuery, [classroom_id]);

        if (classroomIDResult.rows.length <= 0) {
            await createLog(user_id, classroom_id, null, null, "removeStudentFromClassroom: Classroom not found", false);
            return res.status(400).json({ status: "false", message: "No classroom with the corresponding ID found in the database." });
        }

        const studentAlreadyInClassroomQuery = `SELECT * FROM ispartof WHERE user_id = $1 AND classroom_id = $2`;
        const studentAlreadyInClassroomResult = await pool.query(studentAlreadyInClassroomQuery, [user_id, classroom_id]);

        if (studentAlreadyInClassroomResult.rows.length <= 0) {
            await createLog(user_id, classroom_id, null, null, "removeStudentFromClassroom: Student not part of classroom", false);
            return res.status(404).json({ status: "false", message: "Student with this ID has not been assigned to this classroom." });
        }

        const removeStudentFromClassroomQuery = `DELETE FROM ispartof WHERE user_id = $1 AND classroom_id = $2`;
        await pool.query(removeStudentFromClassroomQuery, [user_id, classroom_id]);

        await createLog(user_id, classroom_id, null, null, `removeStudentFromClassroom OK: Removed user from classroom ${classroom_id}`, true);

        res.status(200).json({
            status: "success",
            message: "Student was removed from classroom successfully.",
        });

    } catch (error) {
        await createLog(user_id, classroom_id, null, null, `Error in removeStudentFromClassroom: ${error.message}`, false);
        res.status(500).json({ status: "false", message: "Removing student from classroom failed", error: error.message });
    }
};

export const addNoteToStudent = async (req, res) => {
    const {
        note_text,
        classroom_id,
        user_id
    } = req.body;

    if (!note_text || !classroom_id || !user_id) {
        await createLog(user_id, classroom_id, null, null, "addNoteToStudent: Missing required fields", false);
        return res.status(400).json({ status: "false", message: "Missing required fields" });
    }

    try {
        const userQuery = `SELECT * FROM userr WHERE user_id = $1`;
        const userResult = await pool.query(userQuery, [user_id]);

        if (userResult.rows.length === 0) {
            await createLog(user_id, classroom_id, null, null, "addNoteToStudent: User not found", false);
            return res.status(400).json({ status: "false", message: "User with this ID was not found in the database." });
        }

        const classroomQuery = `SELECT * FROM classroom WHERE classroom_id = $1`;
        const classroomResult = await pool.query(classroomQuery, [classroom_id]);

        if (classroomResult.rows.length === 0) {
            await createLog(user_id, classroom_id, null, null, "addNoteToStudent: Classroom not found", false);
            return res.status(400).json({ status: "false", message: "Classroom with this ID does not exist." });
        }

        const alreadyExistsQuery = 'SELECT * FROM note WHERE note_text = $1 AND user_id = $2 AND classroom_id = $3';
        const alreadyExistsResult = await pool.query(alreadyExistsQuery, [note_text, user_id, classroom_id]);

        if (alreadyExistsResult.rows.length > 0) {
            await createLog(user_id, classroom_id, null, null, "addNoteToStudent: Note already exists", false);
            return res.status(400).json({ status: "false", message: "This note already exists." });
        }

        const addNoteQuery = `
            INSERT INTO note (note_text, date, classroom_id, user_id)
            VALUES ($1, NOW(), $2, $3)
        `;
        await pool.query(addNoteQuery, [note_text, classroom_id, user_id]);

        await createLog(user_id, classroom_id, null, null, `addNoteToStudent OK: Note added to classroom ${classroom_id}`, true);

        res.status(200).json({
            status: "success",
            message: "Note added to classroom successfully.",
        });

    } catch (error) {
        await createLog(user_id, classroom_id, null, null, `Error in addNoteToStudent: ${error.message}`, false);
        res.status(500).json({ status: "false", message: "Adding note to classroom failed", error: error.message });
    }
};

export const deleteNoteFromStudent = async (req, res) => {
    const { note_text, classroom_id, user_id } = req.body;

    if (!note_text || !classroom_id || !user_id) {
        await createLog(user_id, classroom_id, null, null, "deleteNoteFromStudent: Missing required fields", false);
        return res.status(400).json({ status: "false", message: "Missing required fields" });
    }

    try {
        const userQuery = `SELECT * FROM userr WHERE user_id = $1`;
        const userResult = await pool.query(userQuery, [user_id]);

        if (userResult.rows.length === 0) {
            await createLog(user_id, classroom_id, null, null, "deleteNoteFromStudent: User not found", false);
            return res.status(400).json({ status: "false", message: "User with this ID was not found in the database." });
        }

        const classroomQuery = `SELECT * FROM classroom WHERE classroom_id = $1`;
        const classroomResult = await pool.query(classroomQuery, [classroom_id]);

        if (classroomResult.rows.length === 0) {
            await createLog(user_id, classroom_id, null, null, "deleteNoteFromStudent: Classroom not found", false);
            return res.status(400).json({ status: "false", message: "Classroom with this ID does not exist." });
        }

        const noteQuery = `SELECT * FROM note WHERE note_text = $1 AND classroom_id = $2 AND user_id = $3`;
        const noteResult = await pool.query(noteQuery, [note_text, classroom_id, user_id]);

        if (noteResult.rows.length === 0) {
            await createLog(user_id, classroom_id, null, null, "deleteNoteFromStudent: Note not found", false);
            return res.status(404).json({ status: "false", message: "Note not found." });
        }

        const deleteNoteQuery = `DELETE FROM note WHERE note_text = $1 AND classroom_id = $2 AND user_id = $3`;
        await pool.query(deleteNoteQuery, [note_text, classroom_id, user_id]);

        await createLog(user_id, classroom_id, null, null, `deleteNoteFromStudent OK: Note deleted from classroom ${classroom_id}`, true);

        res.status(200).json({
            status: "success",
            message: "Note deleted successfully.",
        });

    } catch (error) {
        await createLog(user_id, classroom_id, null, null, `Error in deleteNoteFromStudent: ${error.message}`, false);
        res.status(500).json({ status: "false", message: "Deleting note from classroom failed", error: error.message });
    }
};

export const updateNoteForStudent = async (req, res) => {
    const { note_id, note_text, classroom_id, user_id } = req.body;

    if (!note_id || !note_text || !classroom_id || !user_id) {
        await createLog(user_id, classroom_id, null, null, "updateNoteForStudent: Missing required fields", false);
        return res.status(400).json({ status: "false", message: "Missing required fields" });
    }

    try {
        const userQuery = `SELECT * FROM userr WHERE user_id = $1`;
        const userResult = await pool.query(userQuery, [user_id]);

        if (userResult.rows.length === 0) {
            await createLog(user_id, classroom_id, null, null, "updateNoteForStudent: User not found", false);
            return res.status(400).json({ status: "false", message: "User not found" });
        }

        const noteQuery = `SELECT * FROM note WHERE note_id = $1 AND classroom_id = $2 AND user_id = $3`;
        const noteResult = await pool.query(noteQuery, [note_id, classroom_id, user_id]);

        if (noteResult.rows.length === 0) {
            await createLog(user_id, classroom_id, null, null, "updateNoteForStudent: Note not found", false);
            return res.status(404).json({ status: "false", message: "Note not found" });
        }

        const updateNoteQuery = `UPDATE note SET note_text = $1 WHERE note_id = $2`;
        await pool.query(updateNoteQuery, [note_text, note_id]);

        await createLog(user_id, classroom_id, null, null, `updateNoteForStudent OK: Note updated in classroom ${classroom_id}`, true);

        res.status(200).json({
            status: "success",
            message: "Note updated successfully.",
        });

    } catch (error) {
        await createLog(user_id, classroom_id, null, null, `Error in updateNoteForStudent: ${error.message}`, false);
        res.status(500).json({ status: "false", message: "Error updating note", error: error.message });
    }
};

export const getClassroomInterval = async (req, res) => {
    const { classroom_id } = req.query;
    
    if (!classroom_id) {
        await createLog(null, classroom_id, null, null, "getClassroomInterval: Missing classroom_id", false);
        return res.status(400).json({ status: "false", message: "classroom_id is required" });
    }

    try {
        const query = `
            SELECT start_time, end_time 
            FROM classroom 
            WHERE classroom_id = $1
        `;
        const result = await pool.query(query, [classroom_id]);

        if (result.rows.length === 0) {
            await createLog(null, classroom_id, null, null, "getClassroomInterval: Classroom not found", false);
            return res.status(404).json({ status: "false", message: "Classroom not found" });
        }

        const { start_time, end_time } = result.rows[0];
        await createLog(null, classroom_id, null, null, "getClassroomInterval: Classroom interval retrieved successfully", true);

        res.status(200).json({
            status: "success",
            message: "Classroom interval retrieved successfully.",
            start_time,
            end_time,
        });
    } catch (error) {
        await createLog(null, classroom_id, null, null, `Error in getClassroomInterval: ${error.message}`, false);
        res.status(500).json({
            status: "false",
            message: "Error fetching classroom interval",
            error: error.message,
        });
    }
};

export const getTaskAssignedToClass = async (req, res) => {
    const { classroom_id } = req.body;  
  
    if (!classroom_id) {
      await createLog(null, classroom_id, null, null, "getTaskAssignedToClass: Missing classroom_id", false);
      return res.status(400).json({ error: "Classroom ID is required." });
    }
  
    try {
      const result = await pool.query(
        `SELECT task.task_id, task.title, task.description, classroomtask.lock_date, classroomtask.start_date
         FROM classroomtask
         JOIN task ON classroomtask.task_id = task.task_id
         WHERE classroomtask.classroom_id = $1`,
        [classroom_id]
      );
  
      if (result.rows.length === 0) {
        await createLog(null, classroom_id, null, null, "getTaskAssignedToClass: No tasks found for this classroom", false);
        return res.status(404).json({ message: "No tasks found for this class." });
      }
  
      await createLog(null, classroom_id, null, null, "getTaskAssignedToClass: Tasks retrieved successfully", true);
      res.status(200).json(result.rows);
    } catch (error) {
      await createLog(null, classroom_id, null, null, `getTaskAssignedToClass: ${error.message}`, false);
      res.status(500).json({ error: "Internal server error." });
    }
  };

export const getAllStudents = async (req, res) => {
    const { class_id } = req.params; 

    // if (!class_id){
    //   await createLog(null, class_id, null, null, "getAllStudents: Missing class_id", false);
    //   return res.status(400).json({ error: "Classroom ID is required." });
    // } 
  
    try {
      const result = await pool.query(
        `SELECT u.user_id, u.email, u.nick, u.role, u.honor, u.registration_date, u.last_login_date
         FROM userR u
         LEFT JOIN ispartof cs ON u.user_id = cs.user_id
         WHERE u.role = 'student' AND (cs.classroom_id != $1 OR cs.classroom_id IS NULL)`, 
        [class_id] 
      );
  
      await createLog(null, class_id, null, null, "getAllStudents: Students retrieved successfully", true);
      res.status(200).json({
        status: "success",
        message: "Student users retrieved successfully",
        students: result.rows
      });
    } catch (error) {
      await createLog(null, class_id, null, null, `getAllStudents: ${error.message}`, false);
      res.status(500).json({ status: "false", message: "Error retrieving students" });
    }
};  
  
export const getOneClass = async (req, res) => {
    const { class_id } = req.body;
  
    if (!class_id) {
      await createLog(null, class_id, null, null, "getOneClass: Missing class_id", false);
      return res.status(400).json({ status: "false", message: "Missing class_id" });
    }
  
    try {
      const classQuery = `
        SELECT c.classroom_id, c.name, c.start_time, c.end_time, c.day_of_week, 
               c.subject, c.user_id, ctl.list_id
        FROM classroom c
        LEFT JOIN classroommlistoftasks ctl ON c.classroom_id = ctl.classroom_id
        WHERE c.classroom_id = $1
      `;
      const classResult = await pool.query(classQuery, [class_id]);
  
      if (classResult.rows.length === 0) {
        await createLog(null, class_id, null, null, "getOneClass: Class not found", false);
        return res.status(404).json({ status: "false", message: "Class not found" });
      }
  
      const classroom = classResult.rows[0];
  
      const studentsQuery = `
        SELECT 
          u.user_id AS id, 
          u.nick AS name, 
          u.honor AS totalHonor,
          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'note_id', n.note_id,
                'note_text', n.note_text, 
                'date', TO_CHAR(n.date, 'YYYY-MM-DD HH24:MI:SS')
              )
            ) FILTER (WHERE n.note_id IS NOT NULL), '[]' 
          ) AS notes
        FROM userR u
        JOIN isPartOf ip ON u.user_id = ip.user_id
        LEFT JOIN note n ON u.user_id = n.user_id AND n.classroom_id = $1
        WHERE ip.classroom_id = $1
        GROUP BY u.user_id, u.nick, u.honor
      `;
      const studentsResult = await pool.query(studentsQuery, [class_id]);
  
      classroom.students = studentsResult.rows;
  
      await createLog(null, class_id, null, null, "getOneClass: Class and students retrieved successfully", true);
      return res.status(200).json({ status: "true", class: classroom });
    } catch (error) {
      await createLog(null, class_id, null, null, `getOneClass: ${error.message}`, false);
      return res.status(500).json({ status: "false", message: "Server error" });
    }
};

export const assignTaskToClasses = async (req, res) => {
    const { task_id, classrooms, start_date, start_hour, lock_date, lock_hour } = req.body;
  
    if (!start_date || !start_hour) {
      await createLog(null, null, task_id, null, "assignTaskToClasses: Missing start date or hour", false);
      return res.status(400).json({status: "false", message: "Start date and start hour are required" });
    }
  
    try {
      await assignTaskToClassrooms(pool, task_id, classrooms, start_date, start_hour, lock_date, lock_hour);
      await createLog(null, null, task_id, null, "assignTaskToClasses: Task assigned to classrooms", true);
      return res.status(200).json({ status: "success", message: `Task ${task_id} assigned to classrooms successfully` });
    } catch (error) {
      await createLog(null, null, task_id, null, `assignTaskToClasses: ${error.message}`, false);
      return res.status(500).json({status: "false", message: "Error assigning task to classrooms", error: error.message });
    }
};

/*export const scheduleTaskForClassroom = async (req, res) => {
    const { classroom_ids, task_id, start_date, end_date, start_time, end_time } = req.body;

    // Overíme, či boli poskytnuté všetky potrebné údaje
    if (!classroom_ids || !Array.isArray(classroom_ids) || classroom_ids.length === 0 || !task_id || !start_date || !end_date || !start_time || !end_time) {
        return res.status(400).json({ status: "false", message: "Missing or invalid required fields" });
    }

    try {
        // Overíme, či všetky triedy existujú
        const classroomQuery = "SELECT classroom_id FROM classroom WHERE classroom_id = ANY($1)";
        const classroomResult = await pool.query(classroomQuery, [classroom_ids]);

        const existingClassroomIds = classroomResult.rows.map(row => row.classroom_id);

        if (existingClassroomIds.length !== classroom_ids.length) {
            return res.status(404).json({ status: "false", message: "One or more classrooms not found" });
        }

        // Overíme, či úloha existuje
        const taskQuery = "SELECT * FROM task WHERE task_id = $1";
        const taskResult = await pool.query(taskQuery, [task_id]);

        if (taskResult.rows.length === 0) {
            return res.status(404).json({ status: "false", message: "Task not found" });
        }

        // Vložíme záznamy pre všetky triedy
        const insertQuery = `
            INSERT INTO classroom_task_schedule (classroom_id, task_id, start_date, end_date, start_time, end_time)
            VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *;
        `;

        let insertedRecords = [];
        for (const classroom_id of classroom_ids) {
            const insertResult = await pool.query(insertQuery, [classroom_id, task_id, start_date, end_date, start_time, end_time]);
            insertedRecords.push(insertResult.rows[0]);
        }

        // Odošleme odpoveď so všetkými vloženými záznamami
        res.status(201).json({
            status: "success",
            message: "Task scheduled for classrooms successfully",
            data: insertedRecords
        });

    } catch (error) {
        console.error("Error scheduling task for classrooms:", error.message);
        res.status(500).json({ status: "false", message: "Error scheduling task", error: error.message });
    }
};*/

export const getTaskIntervalForClass = async (req, res) => {
    const { classroom_id, task_id } = req.body;

    console.log(classroom_id + " " + task_id);

    if (!classroom_id || !task_id) {
        return res.status(400).json({ error: "Classroom ID and Task ID are required." });
    }

    try {
        const result = await pool.query(
            `SELECT classroomtask.start_date, classroomtask.lock_date 
             FROM classroomtask
             WHERE classroomtask.classroom_id = $1 AND classroomtask.task_id = $2`,
            [classroom_id, task_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No interval found for this task in the selected class." });
        }

        res.status(200).json(result.rows[0]);  // ✅ Posielame iba 1 výsledok, nie pole
    } catch (error) {
        console.error("Error fetching task interval:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};