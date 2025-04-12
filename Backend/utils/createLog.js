import pool from "../db/connectDB.js"; 

export const createLog = async (userId = null, classroomId = null, taskId = null, solutionId = null, logMessage, logStatus) => {
  try {
    // Step 1: Check for existing recent log (within the last 5 seconds)
    const existingLog = await pool.query(
      `SELECT log_id FROM logs 
       WHERE user_id IS NOT DISTINCT FROM $1
         AND classroom_id IS NOT DISTINCT FROM $2
         AND task_id IS NOT DISTINCT FROM $3
         AND solution_id IS NOT DISTINCT FROM $4
         AND log_message = $5
         AND log_status = $6
         AND created_at > NOW() - INTERVAL '5 seconds'
       LIMIT 1;`,
      [userId, classroomId, taskId, solutionId, logMessage, logStatus]
    );

    if (existingLog.rows.length > 0) {
      return existingLog.rows[0].log_id;
    }

    // Step 2: Insert new log
    const result = await pool.query(
      `INSERT INTO logs (user_id, classroom_id, task_id, solution_id, log_message, log_status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING log_id;`,
      [userId, classroomId, taskId, solutionId, logMessage, logStatus]
    );

    const logId = result.rows[0].log_id;
    return logId;

  } catch (error) {
    throw error;
  }
};
