import { executeCodeWithTests } from '../utils/executeCodeInContainer.js'; // Ensure you import the function
import pool from "../db/connectDB.js";
import { decodeToken } from '../utils/decodeToken.js'
import { createNotification } from '../utils/createNotifications.js';
import { upsertTaskCode } from '../utils/updateTaskCode.js';
import { assignTaskToClassrooms } from '../utils/assignTaskToClassrooms.js'
import { addTaskToList } from '../utils/addTaskToList.js';
import { createLog } from '../utils/createLog.js';  // Assuming createLog is in logService.js

export const editTask = async (req, res) => {
  const {
    description,
    title,
    difficulty_name,
    languages,
    problem_type,
    classrooms,
    start_date,
    end_date,
    start_time,
    end_time
  } = req.body;

  if (!description || !languages || !title || !difficulty_name || !problem_type) {
    const logMessage = "Missing required fields";
    await createLog(null, null, null, null, logMessage, false);
    return res.status(400).json({ status: "false", message: logMessage });
  }

  let allResults = [];
  for (const [programming_language, { solution_code, unit_test_code }] of Object.entries(languages)) {
    const executionResult = await executeCodeWithTests(solution_code, unit_test_code, programming_language);

    allResults.push({
      programming_language,
      success: executionResult.success,
      message: executionResult.success ? "Code executed successfully" : "Code execution failed",
      error: executionResult.success ? null : executionResult.message,
      output: executionResult.output,
    });
  }

  const failedExecution = allResults.find(result => !result.success);

  if (failedExecution) {
    const logMessage = "Code execution failed for some languages";
    await createLog(null, null, null, null, logMessage, false);
    return res.status(200).json({
      status: "false",
      message: logMessage,
      results: allResults,
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const taskQuery = `SELECT task_id FROM task WHERE title = $1`;
    const taskResult = await client.query(taskQuery, [title]);
    if (taskResult.rowCount === 0) {
      await client.query("ROLLBACK");
      const logMessage = "Task not found";
      await createLog(null, null, null, null, logMessage, false);
      return res.status(404).json({ status: "false", message: logMessage });
    }
    const task_id = taskResult.rows[0].task_id;

    const difficultyQuery = `SELECT difficulty_id FROM difficulty WHERE name = $1`;
    const difficultyResult = await client.query(difficultyQuery, [difficulty_name]);
    if (difficultyResult.rowCount === 0) {
      await client.query("ROLLBACK");
      const logMessage = "Difficulty not found";
      await createLog(null, null, null, null, logMessage, false);
      return res.status(404).json({ status: "false", message: logMessage });
    }
    const difficulty_id = difficultyResult.rows[0].difficulty_id;

    const updateTaskQuery = `UPDATE task SET description = $1, difficulty_id = $2, problem_type = $3 WHERE task_id = $4`;
    await client.query(updateTaskQuery, [description, difficulty_id, problem_type, task_id]);

    await upsertTaskCode(client, task_id, languages);
    await assignTaskToClassrooms(client, task_id, classrooms, start_date, start_time, end_date, end_time);

    await client.query("COMMIT");

    const logMessage = "Task updated successfully";
    await createLog(null, null, task_id, null, logMessage, true);

    res.status(200).json({
      status: "true",
      message: logMessage,
      task_id,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    const logMessage = "Task update failed: " + error.message;
    await createLog(null, null, null, null, logMessage, false);
    res.status(500).json({ status: "false", message: "Task update failed", error: error.message });
  } finally {
    client.release();
  }
};

export const addTask = async (req, res) => {
  const {
    description,
    title,
    author_nickname,
    difficulty_name,
    languages,
    problem_type,
    classrooms,
    start_date,
    end_date,
    start_time,
    end_time,
  } = req.body;

  const { userID } = await decodeToken(req);

  if (!description || !languages || !title || !author_nickname || !difficulty_name || !problem_type) {
    const logMessage = "Missing required fields";
    await createLog(userID, null, null, null, logMessage, false);
    return res.status(400).json({ status: "false", message: logMessage });
  }

  // let allResults = [];
  // for (const [programming_language, { solution_code, unit_test_code }] of Object.entries(languages)) {
  //   const executionResult = await executeCodeWithTests(solution_code, unit_test_code, programming_language);

  //   allResults.push({
  //     programming_language,
  //     success: executionResult.success,
  //     message: executionResult.success ? "Code executed successfully" : "Code execution failed",
  //     error: executionResult.success ? null : executionResult.message,
  //     output: executionResult.output,
  //   });
  // }

  // const failedExecution = allResults.find(result => !result.success);

  // if (failedExecution) {
  //   const logMessage = "Code execution failed for some languages";
  //   await createLog(userID, null, null, null, logMessage, false);
  //   return res.status(200).json({
  //     status: "false",
  //     message: logMessage,
  //     results: allResults,
  //   });
  // }

  const client = await pool.connect(); 
  try {
    await client.query("BEGIN");
  
    // Get author details and check contributor flag and role
    const authorQuery = `SELECT user_id, contributor_flag, role FROM userr WHERE nick = $1`;
    const authorResult = await client.query(authorQuery, [author_nickname]);
    if (authorResult.rowCount === 0) {
      const logMessage = "Author not found";
      await createLog(userID, null, null, null, logMessage, false);
      throw new Error(logMessage);
    }
    const author = authorResult.rows[0];
    const author_id = author.user_id;
    const isAutoVerified = (author.role === 'teacher' || author.contributor_flag === true);
  
    // Get difficulty id
    const difficultyQuery = `SELECT difficulty_id FROM difficulty WHERE name = $1`;
    const difficultyResult = await client.query(difficultyQuery, [difficulty_name]);
    if (difficultyResult.rowCount === 0) {
      const logMessage = "Difficulty not found";
      await createLog(userID, null, null, null, logMessage, false);
      throw new Error(logMessage);
    }
    const difficulty_id = difficultyResult.rows[0].difficulty_id;
  
    const taskQuery = `SELECT task_id FROM task WHERE title = $1`;
    const taskResult = await client.query(taskQuery, [title]);
  
    let task_id;
  
    if (taskResult.rowCount > 0) {
      task_id = taskResult.rows[0].task_id;
      const languageQuery = `SELECT 1 FROM taskCode WHERE task_id = $1 AND programming_language = $2`;
      const languageResult = await client.query(languageQuery, [task_id, programming_language]);
      if (languageResult.rowCount > 0) {
        const logMessage = "Task with the same language already exists";
        await createLog(userID, null, task_id, null, logMessage, false);
        throw new Error(logMessage);
      }
    } else {
      const creation_date = new Date();
      const is_verified = isAutoVerified ? true : false;
  
      const insertTaskQuery = `
        INSERT INTO task (author_id, title, description, creation_date, is_verified, difficulty_id, problem_type)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING task_id`;
      const taskInsertResult = await client.query(insertTaskQuery, [
        author_id,
        title,
        description,
        creation_date,
        is_verified,
        difficulty_id,
        problem_type
      ]);
      task_id = taskInsertResult.rows[0].task_id;
  
      if (author.contributor_flag === true) {
        await client.query(`UPDATE userR SET honor = honor + 20 WHERE user_id = $1`, [author_id]);
      }
    }
  
    await upsertTaskCode(client, task_id, languages);
    await addTaskToList(client, task_id, userID, { list_name: "Created Tasks" });
    await assignTaskToClassrooms(client, task_id, classrooms, start_date, start_time, end_date, end_time);
    await createNotification("New Task Added", "You have successfully created a task", author_id);
  
    await client.query("COMMIT");
  
    const logMessage = "Task created or updated successfully";
    await createLog(userID, null, task_id, null, logMessage, true);
  
    res.status(200).json({
      status: "true",
      message: logMessage,
      task_id,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    const logMessage = "Task creation or update failed: " + error.message;
    await createLog(userID, null, null, null, logMessage, false);
    res.status(500).json({ status: "false", message: error.message, error: error.message });
  } finally {
    client.release();
  }  
};

export const getTasks = async (req, res) => {
  let user_id = null;

  try {
    const { userID } = decodeToken(req);
    user_id = userID;  
  } catch (error) {
    await createLog(null, null, null, null, "error decoding token", false);

  }

  const { 
    selectedDifficulty, 
    selectedProblemType, 
    selectedPostedAt, 
    selectedLanguage, 
    list_id, 
    classroom_id, 
    selectedPopularity, 
    selectedClassTask,
    selectedFilters, 
  } = req.body;

  try {
    let query = ` 
      SELECT 
        t.task_id, 
        t.title, 
        t.description, 
        t.creation_date, 
        t.is_verified, 
        t.likes,
        t.dislikes,
        u.nick AS author_nickname, 
        d.name AS difficulty,
        t.problem_type,
        ARRAY_AGG(tc.programming_language) AS available_languages
      FROM task t
      JOIN userr u ON t.author_id = u.user_id
      JOIN difficulty d ON t.difficulty_id = d.difficulty_id
      LEFT JOIN taskCode tc ON t.task_id = tc.task_id
    `;

    let queryParams = [];
    let filterConditions = [];

    if (list_id && list_id != 0) {
      query += ` JOIN isInList il ON t.task_id = il.task_id `;
      filterConditions.push(`il.list_id = $${queryParams.length + 1}`);
      queryParams.push(list_id);
    }

    if (selectedDifficulty) {
      filterConditions.push(`d.name = $${queryParams.length + 1}`);
      queryParams.push(selectedDifficulty);
    }

    if (selectedProblemType) {
      filterConditions.push(`t.problem_type = $${queryParams.length + 1}`);
      queryParams.push(selectedProblemType);
    }

    if (selectedLanguage) {
      filterConditions.push(`
        EXISTS (
          SELECT 1 
          FROM taskCode tc 
          WHERE tc.task_id = t.task_id AND tc.programming_language = $${queryParams.length + 1}
        )
      `);
      queryParams.push(selectedLanguage);
    }

    if (selectedPostedAt) {
      let timeCondition = "";
      switch (selectedPostedAt) {
        case "Today":
          timeCondition = "t.creation_date >= NOW() - INTERVAL '1 day'";
          break;
        case "This Week":
          timeCondition = "t.creation_date >= NOW() - INTERVAL '1 week'";
          break;
        case "This Month":
          timeCondition = "t.creation_date >= NOW() - INTERVAL '1 month'";
          break;
        case "This Half Year":
          timeCondition = "t.creation_date >= NOW() - INTERVAL '6 months'";
          break;
        case "This Year":
          timeCondition = "t.creation_date >= NOW() - INTERVAL '1 year'";
          break;
      }
      if (timeCondition) {
        filterConditions.push(timeCondition);
      }
    }

    let joinedClassroomTask = false;
    if (classroom_id && classroom_id != 0) {
      query += ` JOIN classroomtask ct ON t.task_id = ct.task_id `;
      filterConditions.push(`ct.classroom_id = $${queryParams.length + 1}`);
      queryParams.push(classroom_id);
      joinedClassroomTask = true;
      
      filterConditions.push(`ct.start_date <= NOW() AND (ct.lock_date IS NULL OR ct.lock_date >= NOW())`);
    }

    if (selectedClassTask) {
      if (!joinedClassroomTask) {
        query += ` LEFT JOIN classroomtask ct ON t.task_id = ct.task_id `;
        joinedClassroomTask = true;
      }
      switch (selectedClassTask) {
        case "Tasks from My Classes":
          filterConditions.push(`ct.classroom_id IS NOT NULL`);
          break;
        case "Tasks with Deadlines":
          filterConditions.push(`ct.lock_date IS NOT NULL`);
          break;
      }
    }

    if (selectedFilters) {
      if (selectedFilters.upvoted) {
        query += ` JOIN task_likes tl ON t.task_id = tl.task_id `;
        filterConditions.push(`tl.user_id = $${queryParams.length + 1} AND tl.type = 'like'`);
        queryParams.push(user_id);
      }

      if (selectedFilters.downvoted) {
        query += ` JOIN task_likes tl2 ON t.task_id = tl2.task_id `;
        filterConditions.push(`tl2.user_id = $${queryParams.length + 1} AND tl2.type = 'dislike'`);
        queryParams.push(user_id);
      }

      if (selectedFilters.finished) {
        query += ` JOIN solution s ON t.task_id = s.task_id `;
        filterConditions.push(`s.user_id = $${queryParams.length + 1}`);
        queryParams.push(user_id);
      }

      if (selectedFilters.forbidden) {
        query += ` JOIN forbidden_tasks ft ON t.task_id = ft.task_id `;
        filterConditions.push(`ft.user_id = $${queryParams.length + 1}`);
        queryParams.push(user_id);
      }
    }

    if (filterConditions.length > 0) {
      query += ` WHERE ` + filterConditions.join(" AND ");
    }
    
    query += `
      GROUP BY 
        t.task_id, t.title, t.description, t.creation_date, 
        t.is_verified, u.nick, d.name, t.problem_type
    `;

    if (selectedPopularity) {
      switch (selectedPopularity) {
        case "Most Upvoted":
          query += ` ORDER BY (t.likes - t.dislikes) DESC `;
          break;
        case "Most Liked":
          query += ` ORDER BY t.likes DESC `;
          break;
        case "Most Recent":
          query += ` ORDER BY t.creation_date DESC `;
          break;
      }
    }

    const result = await pool.query(query, queryParams);
    if(classroom_id != 0){
      await createLog(user_id, classroom_id, null, null, "getting tasks success", true);
    }else{
      await createLog(user_id, null, null, null, "getting tasks success", true);
    }

    res.status(200).json({
      status: "true",
      message: "Tasks retrieved successfully",
      tasks: result.rows.map(row => ({
        task_id: row.task_id,
        title: row.title,
        description: row.description,
        creation_date: row.creation_date,
        is_verified: row.is_verified,
        author_nickname: row.author_nickname,
        difficulty: row.difficulty,
        problem_type: row.problem_type,
        available_languages: row.available_languages,
        likes: row.likes,
        dislikes: row.dislikes
      })),
    });
  } catch (error) {
    await createLog(null, null, null, null, "Error getting tasks: " + error.message, false);
    res.status(500).json({ status: "false", message: "Error fetching tasks", error: error.message });
  }
};

export const likeOrDislikeTask = async (req, res) => {
  const { userID } = await decodeToken(req);
  const { task_id, type } = req.body;

  if (!['like', 'dislike'].includes(type)) {
    await createLog(userID, null, task_id, null, "Invalid type in reaction", false);
    return res.status(400).json({ status: false, error: "Invalid type. Must be 'like' or 'dislike'." });
  }

  try {
    const existingReaction = await pool.query(
      'SELECT type FROM task_likes WHERE user_id = $1 AND task_id = $2',
      [userID, task_id]
    );

    if (existingReaction.rows.length > 0) {
      const currentType = existingReaction.rows[0].type;

      if (currentType === type) {
        await pool.query(
          'DELETE FROM task_likes WHERE user_id = $1 AND task_id = $2',
          [userID, task_id]
        );
        await pool.query(
          `UPDATE task SET ${type === 'like' ? 'likes' : 'dislikes'} = ${type === 'like' ? 'likes' : 'dislikes'} - 1 WHERE task_id = $1`,
          [task_id]
        );
      } else {
        await pool.query(
          'UPDATE task_likes SET type = $1 WHERE user_id = $2 AND task_id = $3',
          [type, userID, task_id]
        );
        await pool.query(
          `UPDATE task SET 
            likes = likes ${type === 'like' ? '+ 1' : '- 1'},
            dislikes = dislikes ${type === 'dislike' ? '+ 1' : '- 1'}
          WHERE task_id = $1`,
          [task_id]
        );
      }
    } else {
      await pool.query(
        'INSERT INTO task_likes (user_id, task_id, type) VALUES ($1, $2, $3)',
        [userID, task_id, type]
      );
      await pool.query(
        `UPDATE task SET ${type === 'like' ? 'likes' : 'dislikes'} = ${type === 'like' ? 'likes' : 'dislikes'} + 1 WHERE task_id = $1`,
        [task_id]
      );
    }

    const updatedCounts = await pool.query(
      'SELECT likes, dislikes FROM task WHERE task_id = $1',
      [task_id]
    );

    await createLog(userID, null, task_id, null, `Task ${type}d successfully`, true);

    return res.status(200).json({
      status: true,
      message: 'Reaction updated.',
      likes: updatedCounts.rows[0].likes,
      dislikes: updatedCounts.rows[0].dislikes,
    });
  } catch (error) {
    await createLog(userID, null, task_id, null, `Error updating reaction: ${error.message}`, false);
    return res.status(500).json({ status: false, error: 'An error occurred.' });
  }
};

export const getListOfTasks = async (req, res) => {
  const { userID } = await decodeToken(req);

  try {
    const taskListsResult = await pool.query(
      'SELECT list_id, name FROM listoftask WHERE user_id = $1',
      [userID]
    );

    await createLog(userID, null, null, null, "Fetched task lists successfully", true);
    return res.status(200).json({ status: true, lists: taskListsResult.rows });
  } catch (error) {
    await createLog(userID, null, null, null, `Error fetching task lists: ${error.message}`, false);
    return res.status(500).json({ status: false, error: 'An error occurred while fetching task lists.' });
  }
};

export const verifyTask = async (req, res) => {
  const { userID } = await decodeToken(req);
  const { task_id } = req.body;

  if (!task_id) {
    await createLog(userID, null, null, null, "Missing task_id in verify", false);
    return res.status(400).json({ status: false, error: "Task ID is required." });
  }

  try {
    const result = await pool.query(
      `UPDATE task
       SET is_verified = TRUE
       WHERE task_id = $1
       RETURNING task_id, is_verified`,
      [task_id]
    );

    if (result.rows.length === 0) {
      await createLog(userID, null, task_id, null, "Task not found to verify", false);
      return res.status(404).json({ status: false, error: "Task not found." });
    }

    await createLog(userID, null, task_id, null, "Task verified successfully", true);

    res.status(200).json({
      status: true,
      message: "Task successfully verified.",
      task: result.rows[0]
    });
  } catch (error) {
    await createLog(userID, null, task_id, null, `Error verifying task: ${error.message}`, false);
    res.status(500).json({ status: false, error: "Internal server error." });
  }
};

export const addTaskToLikedTasks = async (req, res) => {
  const { userID } = await decodeToken(req); 
  const { task_id } = req.body; 

  if(!task_id){
    await createLog(userID, null, null, null, "Missing task_id in in adding task to likde list", false);
    return res.status(400).json({
      status: "false",
      message: "Missing required fields: task_id",
    });
  }

  try {
    const listResult = await pool.query(
      `SELECT list_id FROM listOfTask WHERE user_id = $1 AND name = 'Liked Tasks'`,
      [userID]
    );

    let listId;

    if (listResult.rowCount === 0) {
      const newListResult = await pool.query(
        `INSERT INTO listOfTask (name, user_id) VALUES ('Liked Tasks', $1) RETURNING list_id`,
        [userID]
      );
      listId = newListResult.rows[0].list_id;
    } else {
      listId = listResult.rows[0].list_id;
    }

    const taskInListResult = await pool.query(
      `SELECT * FROM isInList WHERE task_id = $1 AND list_id = $2`,
      [task_id, listId]
    );

    if (taskInListResult.rowCount === 0) {
      await pool.query(
        `INSERT INTO isInList (task_id, list_id) VALUES ($1, $2)`,
        [task_id, listId]
      );
      await createLog(userID, null, task_id, null, "Task liked", true);
      res.status(200).json({ status: "success", message: "Task added to liked tasks" });
    } else {
      await pool.query(
        `DELETE FROM isInList WHERE task_id = $1 AND list_id = $2`,
        [task_id, listId]
      );
      await createLog(userID, null, task_id, null, "Task unliked", true);
      res.status(200).json({ status: "success", message: "Task removed from liked tasks" });
    }
  } catch (error) {
    await createLog(userID, null, task_id, null, "Failed to like/unlike task", false);
    res.status(400).json({ status: "false", message: error.message });
  }
};

export const runCode = async (req, res) => {
  const { code, task_id, programming_language } = req.body;
  const { userID } = await decodeToken(req); // Optional: if you want user logging

  if (!code || !task_id || !programming_language) {
    await createLog(userID, null, null, null, "Missing required fields", false);
    return res.status(400).json({
      status: "false",
      message: "Missing required fields: code, task_id, or programming_language",
    });
  }

  const supportedLanguages = ['java', 'python', 'c'];
  if (!supportedLanguages.includes(programming_language.toLowerCase())) {
    return res.status(400).json({
      status: "false",
      message: `Unsupported programming language: ${programming_language}`,
    });
  }

  try {
    const testCodeResult = await pool.query(
      `SELECT unit_test_code FROM taskCode WHERE task_id = $1 AND programming_language = $2`,
      [task_id, programming_language]
    );

    if (testCodeResult.rowCount === 0) {
      await createLog(userID, null, task_id, null, "No unit test code found", false);
      return res.status(404).json({
        status: "false",
        message: `No test code found for task ID: ${task_id} and language: ${programming_language}`,
      });
    }

    const testCode = testCodeResult.rows[0].unit_test_code;
    const executionResult = await executeCodeWithTests(code, testCode, programming_language);

    if (!executionResult.success) {
      await createLog(userID, null, task_id, null, "Code execution failed", false);
      return res.status(200).json({
        status: "false",
        message: "Code execution failed",
        error: executionResult.message,
        output: executionResult.output,
      });
    }

    await createLog(userID, null, task_id, null, "Code executed successfully", true);

    res.status(200).json({
      status: "true",
      message: "Code executed successfully",
      output: executionResult.output,
    });
  } catch (error) {
    await createLog(userID, null, task_id, null, "Error during code execution", false);
    res.status(500).json({
      status: "false",
      message: "Error during code execution",
      error: error.message,
    });
  }
};

export const deleteTask = async (req, res) => {
  const { task_id } = req.body;
  const { userID } = await decodeToken(req);

  if (!task_id) {
    await createLog(userID, null, null, null, "Missing task_id in delete", false);
    return res.status(400).json({ status: "false", message: "Task ID is required." });
  }

  try {
    const taskCheck = await pool.query("SELECT * FROM task WHERE task_id = $1", [task_id]);
    if (taskCheck.rowCount === 0) {
      return res.status(404).json({ status: "false", message: "Task not found." });
    }

    await pool.query("DELETE FROM task_likes WHERE task_id = $1", [task_id]);
    await pool.query("DELETE FROM taskCode WHERE task_id = $1", [task_id]);
    await pool.query("DELETE FROM isInList WHERE task_id = $1", [task_id]);
    await pool.query("DELETE FROM classroomtask WHERE task_id = $1", [task_id]);
    await pool.query("DELETE FROM task WHERE task_id = $1", [task_id]);

    await createLog(userID, null, task_id, null, "Task deleted", true);

    return res.status(200).json({ status: "true", message: "Task successfully deleted." });
  } catch (error) {
    await createLog(userID, null, task_id, null, "Error deleting task", false);
    return res.status(500).json({ status: "false", message: "Error deleting task.", error: error.message });
  }
};

export const getTasksByUser = async (req, res) => {
  const { user_id } = req.body;

  if(!user_id){
    await createLog(user_id, null, null, null, "Missing user_id in getTaskByUser", false);
    return res.status(400).json({
      status: "false",
      message: "Missing required fields: user_id",
    });
  }

  try {
    const taskQuery = `
      SELECT
        t.task_id,
        t.title,
        t.description,
        t.creation_date,
        t.is_verified,
        t.likes,
        t.dislikes,
        u.nick AS author_nickname,
        d.name AS difficulty,
        t.author_id 
      FROM task t
             JOIN userr u ON t.author_id = u.user_id
             JOIN difficulty d ON t.difficulty_id = d.difficulty_id
      WHERE t.author_id = $1
    `;

    const result = await pool.query(taskQuery, [user_id]);

    if (result.rows.length === 0) {
      await createLog(user_id, null, null, null, "No tasks found for user", false);
      return res.status(404).json({
        status: "false",
        message: "No tasks found for this user"
      });
    }

    const tasks = result.rows.map((row) => ({
      task_id: row.task_id,
      title: row.title,
      description: row.description,
      author_nickname: row.author_nickname,
      difficulty: row.difficulty,
      likes: row.likes,
      dislikes: row.dislikes,
      programming_language: row.programming_language,
      author_id: row.author_id,
    }));

    await createLog(user_id, null, null, null, "Fetched tasks by user", true);

    res.status(200).json({
      status: "true",
      message: "Tasks retrieved successfully",
      tasks,
    });

  } catch (error) {
    await createLog(user_id, null, null, null, "Error fetching tasks by user", false);
    res.status(500).json({
      status: "false",
      message: "Error fetching tasks by user",
      error: error.message
    });
  }
};

export const pushTaskReportBug = async (req, res) => {
  try {
    const { userID } = await decodeToken(req);
    const { task_id, report_message, author_nickname } = req.body;

    if (!task_id || !report_message || !author_nickname) {
      await createLog(userID, null, null, null, "Missing required fields in bug report", false);
      return res.status(400).json({
        status: "false",
        message: "Missing required fields: task_id, report_message, or author_nickname",
      });
    }

    const query = `
      INSERT INTO taskBugReport (report_message, task_id, user_id, author_nickname)
      VALUES ($1, $2, $3, $4) RETURNING report_id;
    `;
    const result = await pool.query(query, [report_message, task_id, userID, author_nickname]);

    if (result.rows.length > 0) {
      const userQuery = `
        SELECT user_id 
        FROM userR 
        WHERE nick = $1;
      `;

      const userResult = await pool.query(userQuery, [author_nickname]);

      const taskQuery = `SELECT title
                         FROM task
                         WHERE task_id = $1`;
      const taskResult = await pool.query(taskQuery, [task_id]);

      if (userResult.rows.length > 0 && taskResult.rows.length > 0) {
        const author_id = userResult.rows[0].user_id;
        const title = taskResult.rows[0].title;
        const notificationMessage = `Bug report received for task name: ${title} by user: ${author_nickname}. Report message: ${report_message}`;

        await createNotification(
          "New Bug Report Submitted",
          notificationMessage,
          author_id
        );
        await createLog(userID, null, null, null, "Bug report submitted and notification sent", true);

        return res.status(201).json({
          status: "true",
          message: "Bug report submitted successfully and notification sent to author.",
          report_id: result.rows[0].report_id,
        });
      } else {
        await createLog(userID, null, null, null, "Author not found by nickname", false);
        return res.status(404).json({
          status: "false",
          message: "Author not found with the provided nickname",
        });
      }
    } else {
      await createLog(userID, null, null, null, "Failed to submit the bug report", false);
      return res.status(500).json({
        status: "false",
        message: "Failed to submit the bug report.",
      });
    }

  } catch (error) {
    await createLog(userID, null, null, null, "Error occurred while submitting the bug report", false);
    return res.status(500).json({
      status: "false",
      message: "An error occurred while submitting the bug report",
      error: error.message,
    });
  }
};





export const getOneTask = async (req, res) => {
  const { task_id } = req.body;
  let user_id = null;

  try {
    const { userID } = await decodeToken(req);
    user_id = userID;
  } catch (error) {
    await createLog(null, null, task_id, null, "Error decoding token: " + error.message, false);
  }

  try {
    // First query to get task details (excluding classroom-specific data)
    const taskQuery = `
      SELECT
        t.task_id,
        t.title,
        t.description,
        t.creation_date,
        t.is_verified,
        t.likes,
        t.dislikes,
        u.nick AS author_nickname,
        d.name AS difficulty,
        tc.programming_language,
        tc.initial_code,
        tc.solution_code,
        tc.unit_test_code,
        t.author_id
      FROM task t
             JOIN userr u ON t.author_id = u.user_id
             JOIN difficulty d ON t.difficulty_id = d.difficulty_id
             LEFT JOIN taskCode tc ON t.task_id = tc.task_id
      WHERE t.task_id = $1
        LIMIT 1;
    `;

    const taskResult = await pool.query(taskQuery, [task_id]);

    if (taskResult.rows.length === 0) {
      await createLog(user_id, null, task_id, null, "Task not found", false);
      return res.status(404).json({ status: false, message: "Task not found" });
    }

    const taskDetails = taskResult.rows[0];
    const task = {
      task_id: taskDetails.task_id,
      title: taskDetails.title,
      description: taskDetails.description,
      author_nickname: taskDetails.author_nickname,
      difficulty: taskDetails.difficulty,
      dislikes: taskDetails.dislikes,
      likes: taskDetails.likes,
      author_id: taskDetails.author_id,
      languages: {},
    };

    // Add the task's languages, if any
    taskResult.rows.forEach((row) => {
      if (row.programming_language) {
        task.languages[row.programming_language] = {
          initial_code: row.initial_code,
          solution_code: row.solution_code,
          unit_test_code: row.unit_test_code,
        };
      }
    });

    // Second query to get classroom-specific data (start_date, lock_date, classroom_id)
    const classroomTaskQuery = `
      SELECT 
        cst.start_date AS startDate,
        cst.lock_date AS lockDate,
        cst.classroom_id
      FROM classroomtask cst
      WHERE cst.task_id = $1;
    `;

    const classroomTaskResult = await pool.query(classroomTaskQuery, [task_id]);

    // Combine classroom data with task data
    if (classroomTaskResult.rows.length > 0) {
      const classroomTaskDetails = classroomTaskResult.rows[0];

      console.log(classroomTaskDetails);

      task.startDate = classroomTaskDetails.startdate;
      task.lockDate = classroomTaskDetails.lockdate;
      task.classroom_id = classroomTaskDetails.classroom_id;
    } else {
      task.startDate = null;
      task.lockDate = null;
      task.classroom_id = null;
    }

    await createLog(user_id, null, task_id, null, "Fetched task successfully", true);

    res.status(200).json({
      status: true,
      message: "Task retrieved successfully",
      task,
    });
  } catch (error) {
    await createLog(user_id, null, task_id, null, "Error fetching task: " + error.message, false);

    res.status(500).json({
      status: false,
      message: "Error fetching task",
      error: error.message,
    });
  }
};
