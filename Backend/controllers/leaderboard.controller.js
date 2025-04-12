import pool from "../db/connectDB.js"; 
import { createLog } from "../utils/createLog.js"; // Assuming this is where createLog function is imported

export const getStats = async (req, res) => {
    try {
        // Query for daily scores (only first submission per task)
        const dailyQuery = `
            WITH first_submission AS (
                SELECT s.user_id, s.task_id, MIN(s.submission_date) AS first_submission_date
                FROM solution s
                GROUP BY s.user_id, s.task_id
            )
            SELECT 
                u.user_id,
                u.nick,
                fs.user_id, 
                SUM(d.honor_reward) AS daily_points
            FROM first_submission fs
            JOIN solution s ON fs.user_id = s.user_id AND fs.task_id = s.task_id AND fs.first_submission_date = s.submission_date
            JOIN task t ON s.task_id = t.task_id
            JOIN difficulty d ON t.difficulty_id = d.difficulty_id
            JOIN userr u ON s.user_id = u.user_id
            WHERE fs.first_submission_date >= NOW() - INTERVAL '1 DAY'
            GROUP BY fs.user_id, u.nick, u.user_id
            ORDER BY daily_points DESC;
        `;


        // Execute daily query
        const { rows: dailyStats } = await pool.query(dailyQuery);

        const weeklyQuery = `...`; // Same for weekly query
        const completedProblemsQuery = `...`; // Same for completed problems query
        const overallScoreQuery = `...`; // Same for overall score query

        // Execute all queries
        const { rows: weeklyStats } = await pool.query(weeklyQuery);
        const { rows: completedProblems } = await pool.query(completedProblemsQuery);
        const { rows: overallStats } = await pool.query(overallScoreQuery);

        // Log the successful fetch
        await createLog(null, null, null, null, "Leaderboard stats fetched successfully", true);

        // Respond with data
        res.json({ dailyStats, weeklyStats, completedProblems, overallStats });

    } catch (err) {
        // Log the error
        await createLog(null, null, null, null, `Error fetching leaderboard stats: ${err.message}`, false);
        res.status(500).json({ error: "Failed to fetch leaderboard data" });
    }
};

export const getClassroomHonor = async (req, res) => {
    try {
        const { classroomID } = req.body;
        
        const classroomHonorQuery = `
            SELECT 
                u.user_id,
                u.nick,
                i.classroom_honor
            FROM isPartOf i
            JOIN userR u ON i.user_id = u.user_id
            WHERE i.classroom_id = $1
            ORDER BY i.classroom_honor DESC;
        `;

        // Execute the classroom honor query
        const { rows: classroomHonor } = await pool.query(classroomHonorQuery, [classroomID]);

        // Log the successful fetch
        await createLog(null, classroomHonor, null, null, `Classroom honor data fetched for classroom ID: ${classroomID}`, true);

        res.json({ classroomHonor });
    } catch (err) {
        // Log the error
        await createLog(null, classroomID, null, null, `Error fetching classroom honor data: ${err.message}`,false);
        res.status(500).json({ error: "Failed to fetch classroom honor data" });
    }
};
