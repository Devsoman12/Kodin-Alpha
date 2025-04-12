import pool from "../db/connectDB.js"; // Import the database connection pool

export const createNotification = async (title, message, user_id) => {
    try {
        if (!title || !message || !user_id) {
            throw new Error("Missing required parameters");
        }

        const query = `
            INSERT INTO notification (title, message, push_date, was_read, user_id)
            VALUES ($1, $2, NOW(), FALSE, $3)
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [title, message, user_id]);

        return { status: "success", notification: rows[0] };
    } catch (error) {
        console.error("Error creating notification:", error);
        return { status: "error", message: "Failed to create notification" };
    }
};