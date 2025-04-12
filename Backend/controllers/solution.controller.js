import pool from "../db/connectDB.js";
import { addTaskToList } from "../utils/addTaskToList.js";
import { decodeToken } from "../utils/decodeToken.js";
import { executeCodeWithTests } from '../utils/executeCodeInContainer.js'; // Ensure you import the function
import { createLog } from "../utils/createLog.js";

export const submitSolution = async (req, res) => {
  const { userID } = await decodeToken(req);
  const { code, programming_language, task_id, classroom_id } = req.body;

  if (!code || !userID || !task_id || !programming_language) {
    await createLog(userID, classroom_id, task_id, null, "Missing required fields", false);
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const testCodeResult = await client.query(
      `SELECT unit_test_code FROM taskCode WHERE task_id = $1 AND programming_language = $2`,
      [task_id, programming_language]
    );

    if (testCodeResult.rowCount === 0) {
      await client.query('ROLLBACK');
      await createLog(userID, classroom_id, task_id, null, "No test code found", false);
      return res.status(404).json({
        status: "false",
        message: `No test code found for task ID: ${task_id} and language: ${programming_language}`,
      });
    }

    const testCode = testCodeResult.rows[0].unit_test_code;
    const executionResult = await executeCodeWithTests(code, testCode, programming_language);

    if (!executionResult.success) {
      await client.query('ROLLBACK');
      await createLog(userID, classroom_id, task_id, null, "Code execution failed", false);
      return res.status(400).json({
        status: "false",
        message: "Code execution failed",
        error: executionResult.message,
        output: executionResult.output,
      });
    }

    const { successfulTests, totalTests } = executionResult;

    if (classroom_id == 0) {
      // NORMAL SUBMISSION
      const firstSolutionCheck = await client.query(
        `SELECT 1
         FROM solution s
         WHERE s.user_id = $1 
           AND s.task_id = $2 
           AND NOT EXISTS (
             SELECT 1 
             FROM classroomsolution cs
             WHERE cs.solution_id = s.solution_id
               AND cs.task_id = s.task_id
           )`,
        [userID, task_id]
      );

      const isFirstSolution = firstSolutionCheck.rowCount === 0;

      const insertSolution = await client.query(
        `INSERT INTO solution (submission_date, code, programming_language, votes, user_id, task_id, successfultests, totaltests)
         VALUES (CURRENT_TIMESTAMP, $1, $2, 0, $3, $4, $5, $6)
         RETURNING solution_id`,
        [code, programming_language, userID, task_id, successfulTests, totalTests]
      );

      const solutionId = insertSolution.rows[0].solution_id;

      if (isFirstSolution) {
        const difficultyResult = await client.query(
          `SELECT honor_reward FROM difficulty 
           JOIN task ON task.difficulty_id = difficulty.difficulty_id 
           WHERE task.task_id = $1`,
          [task_id]
        );

        if (difficultyResult.rowCount === 0) {
          await client.query('ROLLBACK');
          await createLog(userID, null, task_id, solutionId, "No difficulty found", false);
          return res.status(404).json({
            status: "false",
            message: `No difficulty found for task ID: ${task_id}`,
          });
        }

        const honorReward = difficultyResult.rows[0].honor_reward;

        await client.query(
          `UPDATE userr SET honor = honor + $1 WHERE user_id = $2`,
          [honorReward, userID]
        );
      }

      addTaskToList(pool, task_id, userID, { list_name: "Completed Tasks" });

      await client.query('COMMIT');
      await createLog(userID, null, task_id, null, "Normal solution submitted", true);

      return res.status(200).json({
        status: "true",
        message: isFirstSolution
          ? 'Solution submitted, task marked as completed, and honor level updated.'
          : 'Solution submitted (no additional rewards since task was already completed).',
        output: executionResult.output,
      });

    } else {
      // CLASSROOM SUBMISSION
      const existingClassroomSolution = await client.query(
        `SELECT 1 FROM classroomsolution WHERE task_id = $1 AND classroom_id = $2`,
        [task_id, classroom_id]
      );

      if (existingClassroomSolution.rowCount > 0) {
        await client.query('ROLLBACK');
        await createLog(userID, classroom_id, task_id, null, "Classroom solution already submitted", false);
        return res.status(400).json({
          status: "false",
          message: "A solution for this task has already been submitted in this class.",
        });
      }

      const newSolution = await client.query(
        `INSERT INTO solution (submission_date, code, programming_language, votes, user_id, task_id, successfultests, totaltests)
         VALUES (CURRENT_TIMESTAMP, $1, $2, 0, $3, $4, $5, $6)
         RETURNING solution_id`,
        [code, programming_language, userID, task_id, successfulTests, totalTests]
      );

      const solutionId = newSolution.rows[0].solution_id;

      await client.query(
        `INSERT INTO classroomsolution (task_id, solution_id, classroom_id, user_id) VALUES ($1, $2, $3, $4)`,
        [task_id, solutionId, classroom_id, userID]
      );

      const difficultyResult = await client.query(
        `SELECT honor_reward FROM difficulty 
         JOIN task ON task.difficulty_id = difficulty.difficulty_id 
         WHERE task.task_id = $1`,
        [task_id]
      );

      if (difficultyResult.rowCount === 0) {
        await client.query('ROLLBACK');
        await createLog(userID, classroom_id, task_id, solutionId, "No difficulty found", false);
        return res.status(404).json({
          status: "false",
          message: `No difficulty found for task ID: ${task_id}`,
        });
      }

      const honorReward = difficultyResult.rows[0].honor_reward;

      await client.query(
        `UPDATE isPartOf SET classroom_honor = classroom_honor + $1 
         WHERE user_id = $2 AND classroom_id = $3`,
        [honorReward, userID, classroom_id]
      );

      await client.query('COMMIT');
      await createLog(userID, classroom_id, task_id, solutionId, "Classroom solution submitted", true);

      return res.status(200).json({
        status: "true",
        message: "Classroom solution submitted successfully, class honor updated.",
        output: executionResult.output,
      });
    }
  } catch (error) {
    await client.query('ROLLBACK');
    await createLog(userID, classroom_id, task_id, solutionId, "Unhandled error in submitSolution", false);
    return res.status(500).json({ message: 'An error occurred while submitting the solution.' });
  } finally {
    client.release();
  }
};

export const getAllSolutions = async (req, res) => {
  const { task_id, classroom_id } = req.body;

  if (!task_id) {
    await createLog(null, classroom_id, task_id, null, "Missing required fields", false);
    return res.status(400).json({ status: "false", message: "Task ID is required." });
  }

  try {
    let query = `
      SELECT s.solution_id, s.submission_date, s.code, s.programming_language, 
             s.votes, s.user_id, s.task_id, u.nick AS author_nickname,
             s.successfulTests, s.totalTests
      FROM solution s
      JOIN userr u ON s.user_id = u.user_id
      LEFT JOIN classroomsolution cs ON s.solution_id = cs.solution_id
    `;

    let queryParams = [task_id];

    if (classroom_id && classroom_id !== "0") {
      query += ` WHERE s.task_id = $1 AND cs.classroom_id = $2`;
      queryParams.push(classroom_id);
    } else {
      query += ` WHERE s.task_id = $1 AND cs.classroom_id IS NULL`;
    }

    query += ` ORDER BY s.submission_date DESC`;

    const result = await pool.query(query, queryParams);

    const solutionsWithComments = await Promise.all(
      result.rows.map(async (solution) => {
        const commentResult = await pool.query(
          `SELECT COUNT(*) AS comment_count
           FROM comment c
           WHERE c.solution_id = $1`,
          [solution.solution_id]
        );

        solution.comment_count = commentResult.rows[0].comment_count;
        return solution;
      })
    );

    if (classroom_id != "0"){
      await createLog(null, classroom_id, task_id, null, "Fetched all solutions", true);
    }else{
      await createLog(null, null, task_id, null, "Fetched all solutions", true);
    }

    res.status(200).json({
      status: "true",
      message: "Solutions retrieved successfully.",
      solutions: solutionsWithComments
    });
  } catch (error) {
    await createLog(null, classroom_id, task_id, null, "Error fetching solutions", false);
    res.status(500).json({ status: "false", message: "An error occurred while fetching solutions." });
  }
};

export const commentSolution = async (req, res) => {
  try {
    const { userID } = await decodeToken(req); 
    const { solution_id, task_id, comment_text, parent_id } = req.body; 

    if (!solution_id || !comment_text || !task_id) {
      await createLog(userID, null, task_id, solution_id, "Missing required fields", false);

      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const query = `
      INSERT INTO comment (text, user_id, solution_id, task_id, parent_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING comment_id, text, comment_date, user_id;
    `;

    const values = [comment_text, userID, solution_id, task_id, parent_id || null];

    const result = await pool.query(query, values); 

    const newComment = result.rows[0]; 

    const userQuery = `
      SELECT nick FROM userr WHERE user_id = $1;
    `;
    const userResult = await pool.query(userQuery, [userID]);

    const authorName = userResult.rows[0]?.nick || 'Unknown Author'; 

    await createLog(userID, null, task_id, solution_id, "User commented on solution", true);

    return res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        ...newComment,
        author: authorName, 
      },
    });

  } catch (error) {
    console.error(error);
    await createLog(null, null, task_id, solution_id, "Error commenting on solution", false);
    return res.status(500).json({ message: 'Something went wrong, please try again.' });
  }
};

export const getAllComments = async (req, res) => {
  try {
    const { solution_id } = req.body;

    if (!solution_id) {
      return res.status(400).json({
        status: "false",
        message: "Solution ID is required."
      });
    }

    const query = `
      SELECT c.comment_id AS id, u.nick AS author, c.text, c.comment_date,
             c.parent_id, c.likes, c.dislikes
      FROM comment c
      JOIN userr u ON c.user_id = u.user_id
      WHERE c.solution_id = $1
      ORDER BY c.comment_date ASC;
    `;

    const values = [solution_id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      await createLog(null, null, null, solution_id, "No comments found for solution", false);
      return res.status(404).json({
        status: "false",
        message: "No comments found for this solution."
      });
    }

    const commentMap = new Map();
    const rootComments = [];

    result.rows.forEach((row) => {
      const comment = {
        id: row.id,
        author: row.author,
        text: row.text,
        upvotes: row.likes || 0,
        downvotes: row.dislikes || 0,
        replies: [],
        collapsed: false,
      };

      commentMap.set(row.id, comment);

      if (row.parent_id) {
        if (commentMap.has(row.parent_id)) {
          commentMap.get(row.parent_id).replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    await createLog(null, null, null, solution_id, "Fetched all comments for solution", true);

    return res.status(200).json({
      status: "true",
      message: "Comments retrieved successfully",
      comments: rootComments,
    });

  } catch (error) {
    console.error(error);
    await createLog(null, null, null, solution_id, "Error fetching comments", false);
    return res.status(500).json({
      status: "false",
      message: "Something went wrong, please try again."
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { userID } = await decodeToken(req); 
    const { comment_id } = req.body;

    if (!comment_id) {
      await createLog(userID, null, null, null, "Comment ID missing for delete", false);
      return res.status(400).json({
        status: "false",
        message: "Comment ID is required."
      });
    }

    const query = `
      DELETE FROM comment
      WHERE comment_id = $1 AND user_id = $2
      RETURNING comment_id;
    `;

    const values = [comment_id, userID];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      await createLog(userID, null, null, null, "Comment delete failed (not found or unauthorized)", false);
      return res.status(404).json({
        status: "false",
        message: "Comment not found or you cannot delete someone else's comment."
      });
    }

    await createLog(userID, null, null, null, `Comment ${comment_id} deleted successfully`, true);

    return res.status(200).json({
      status: "true",
      message: "Comment deleted successfully",
      deletedCommentId: result.rows[0].comment_id,
    });

  } catch (error) {
    await createLog(userID, null, null, null, "Error deleting comment", false);
    return res.status(500).json({
      status: "false",
      message: "Something went wrong, please try again."
    });
  }
};

export const editComment = async (req, res) => {
  try {
    const { userID } = await decodeToken(req); 
    const { comment_id, comment_text } = req.body; 

    if (!comment_id || !comment_text) {
      await createLog(userID, null, null, null, "Missing comment_id or comment_text for edit", false);
      return res.status(400).json({
        status: "false",
        message: "Comment ID and text are required."
      });
    }

    const query = `
      UPDATE comment
      SET text = $1
      WHERE comment_id = $2 AND user_id = $3
      RETURNING comment_id, text, comment_date;
    `;

    const values = [comment_text, comment_id, userID];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      await createLog(userID, null, null, null, `Edit failed: Comment ${comment_id} not found or unauthorized`, false);
      return res.status(404).json({
        status: "false",
        message: "Comment not found or you cannot edit someone else's comment."
      });
    }

    await createLog(userID, null, null, null, `Comment ${comment_id} edited successfully`, true);

    return res.status(200).json({
      status: "true",
      message: "Comment updated successfully",
      comment: result.rows[0],
    });

  } catch (error) {
    await createLog(null, null, null, null, "Error editing comment", false);
    return res.status(500).json({
      status: "false",
      message: "Something went wrong, please try again."
    });
  }
};

export const likeOrDislikeCommentForSolution = async (req, res) => {
  try {
    const { userID } = await decodeToken(req);
    const { comment_id, flag } = req.body;


    if (!comment_id || (flag !== 'like' && flag !== 'dislike')) {
      await createLog(userID, null, null, null, "Invalid like/dislike request data", false);
      return res.status(400).json({
        status: "false",
        message: "Invalid request data."
      });
    }

    const column = flag === 'like' ? 'likes' : 'dislikes';
    const oppositeColumn = flag === 'like' ? 'dislikes' : 'likes';

    const checkExistingQuery = `
      SELECT type FROM comment_likes WHERE user_id = $1 AND comment_id = $2;
    `;
    const existingResult = await pool.query(checkExistingQuery, [userID, comment_id]);

    let logMessage = "";
    if (existingResult.rowCount > 0) {
      const existingType = existingResult.rows[0].type;

      const deleteLikeQuery = `DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2;`;
      await pool.query(deleteLikeQuery, [userID, comment_id]);

      if (existingType === flag) {
        const updateQuery = `UPDATE comment SET ${column} = ${column} - 1 WHERE comment_id = $1;`;
        await pool.query(updateQuery, [comment_id]);

        logMessage = `Removed ${flag} from comment ${comment_id}`;
      } else {
        const updateQuery = `
          UPDATE comment 
          SET ${column} = ${column} + 1, ${oppositeColumn} = ${oppositeColumn} - 1
          WHERE comment_id = $1;
        `;
        await pool.query(updateQuery, [comment_id]);

        const insertQuery = `INSERT INTO comment_likes (user_id, comment_id, type) VALUES ($1, $2, $3);`;
        await pool.query(insertQuery, [userID, comment_id, flag]);

        logMessage = `Switched from ${existingType} to ${flag} on comment ${comment_id}`;
      }
    } else {
      const insertQuery = `INSERT INTO comment_likes (user_id, comment_id, type) VALUES ($1, $2, $3);`;
      await pool.query(insertQuery, [userID, comment_id, flag]);

      const updateQuery = `UPDATE comment SET ${column} = ${column} + 1 WHERE comment_id = $1;`;
      await pool.query(updateQuery, [comment_id]);

      logMessage = `Added ${flag} to comment ${comment_id}`;
    }

    const getUpdatedCommentQuery = `
      SELECT c.comment_id AS id, u.nick AS author, c.text, c.comment_date,
             c.parent_id, c.likes, c.dislikes
      FROM comment c
      JOIN userr u ON c.user_id = u.user_id
      WHERE c.comment_id = $1;
    `;
    const updatedCommentResult = await pool.query(getUpdatedCommentQuery, [comment_id]);

    if (updatedCommentResult.rowCount === 0) {
      await createLog(userID, null, null, null, `Failed to retrieve updated comment ${comment_id}`, false);
      return res.status(404).json({
        status: "false",
        message: "Updated comment not found."
      });
    }

    const updatedComment = updatedCommentResult.rows[0];

    await createLog(userID, null, null, null, logMessage, true);

    return res.status(200).json({
      status: "true",
      message: `${flag.charAt(0).toUpperCase() + flag.slice(1)}d successfully`,
      comment: {
        id: updatedComment.id,
        author: updatedComment.author,
        text: updatedComment.text,
        upvotes: updatedComment.likes || 0,
        downvotes: updatedComment.dislikes || 0,
        parent_id: updatedComment.parent_id,
        comment_date: updatedComment.comment_date,
        replies: [],
        collapsed: false,
      },
    });

  } catch (error) {
    await createLog(userID, null, null, null, "Error in like/dislike comment", false);
    return res.status(500).json({
      status: "false",
      message: "Something went wrong, please try again."
    });
  }
};

export const likeSolution = async (req, res) => {
  const { solution_id, task_id } = req.body;
  const { userID } = await decodeToken(req);

  try {
    const solutionCheck = await pool.query(
      `SELECT solution_id FROM solution WHERE solution_id = $1 AND task_id = $2`,
      [solution_id, task_id]
    );

    if (solutionCheck.rowCount === 0) {
      await createLog(userID, null, null, null, "Solution not found for the specified task", false);
      return res.status(404).json({
        status: "false",
        message: "Solution not found for the specified task.",
      });
    }

    const likeCheck = await pool.query(
      `SELECT * FROM hasLikedSolution WHERE user_id = $1 AND solution_id = $2 AND task_id = $3`,
      [userID, solution_id, task_id]
    );

    let logMessage = "";

    if (likeCheck.rowCount > 0) {
      await pool.query(
        `DELETE FROM hasLikedSolution WHERE user_id = $1 AND solution_id = $2 AND task_id = $3`,
        [userID, solution_id, task_id]
      );

      const updatedVotes = await pool.query(
        `UPDATE solution SET votes = votes - 1 WHERE solution_id = $1 AND task_id = $2 RETURNING votes`,
        [solution_id, task_id]
      );

      logMessage = `Solution ${solution_id} unliked by user ${userID}`;
      await createLog(userID, null, task_id, solution_id, logMessage, true);

      return res.status(200).json({
        status: "true",
        message: "Solution unliked successfully.",
        votes: updatedVotes.rows[0].votes,
      });
    } else {
      await pool.query(
        `INSERT INTO hasLikedSolution (user_id, solution_id, task_id) VALUES ($1, $2, $3)`,
        [userID, solution_id, task_id]
      );

      const updatedVotes = await pool.query(
        `UPDATE solution SET votes = votes + 1 WHERE solution_id = $1 AND task_id = $2 RETURNING votes`,
        [solution_id, task_id]
      );

      logMessage = `Solution ${solution_id} liked by user ${userID}`;
      await createLog(userID, null, task_id, solution_id, logMessage, true);

      return res.status(200).json({
        status: "true",
        message: "Solution liked successfully.",
        votes: updatedVotes.rows[0].votes,
      });
    }
  } catch (error) {
    await createLog(userID, null, task_id, solution_id, "Error in like/unlike solution", false);
    res.status(500).json({
      status: "false",
      message: "An error occurred while processing the like/unlike action.",
    });
  }
};