import pool from "../db/connectDB.js"; // Import the database connection pool

export const getUserStats = async (userID) => {
    try {
      let problems_completed = 0;
      let mostUsedLanguage = null;
  
      // Get the list_id for the 'Completed Tasks' list
      const listResult = await pool.query(
        `SELECT list_id FROM listOfTask WHERE user_id = $1 AND name = 'Completed Tasks'`,
        [userID]
      );
  
      if (listResult.rowCount > 0) {
        const listId = listResult.rows[0].list_id;
  
        // Count the number of completed problems in the 'Completed Tasks' list
        const completedProblemsResult = await pool.query(
          `SELECT COUNT(*) FROM isInList WHERE list_id = $1`,
          [listId]
        );
        problems_completed = parseInt(completedProblemsResult.rows[0].count, 10);
      }
  
      // Count the number of comments made by the user
      const commentsCountResult = await pool.query(
        `SELECT COUNT(*) FROM comment WHERE user_id = $1`,
        [userID]
      );
      const comments_count = commentsCountResult.rowCount > 0 
        ? parseInt(commentsCountResult.rows[0].count, 10) 
        : 0;
  
      // Fetch the most used programming language by the user
      const languageResult = await pool.query(
        `SELECT programming_language, COUNT(*) AS language_count
        FROM solution
        WHERE user_id = $1
        GROUP BY programming_language
        ORDER BY language_count DESC
        LIMIT 1`,
        [userID]
      );
  
      if (languageResult.rowCount > 0) {
        mostUsedLanguage = languageResult.rows[0].programming_language;
      }
  
      return { problems_completed, comments_count, mostUsedLanguage };
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw new Error("Error fetching user statistics");
    }
  };