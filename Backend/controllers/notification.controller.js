import pool from "../db/connectDB.js"; // Import the database connection pool
import { decodeToken } from "../utils/decodeToken.js";
import { createLog } from "../utils/createLog.js"; // Import the createLog function

export const getAllNotifications = async (req, res) => {
    try {
        const { userID } = await decodeToken(req);
        const user_id = userID;
        
        if (!user_id) {
            await createLog(null, null, null, null, 'Unauthorized access to notifications', false);
            return res.status(401).json({ status: "error", message: "Unauthorized" });
        }

        const query = `
            SELECT * FROM notification 
            WHERE user_id = $1 AND was_read = FALSE
            ORDER BY push_date DESC;
        `;

        const { rows } = await pool.query(query, [user_id]);

        // Log the success of fetching notifications
        await createLog(user_id, null, null, null, 'Unread notifications retrieved successfully', true);
        return res.status(200).json({ status: "success", notifications: rows });
    } catch (error) {
        // Log the error if fetching notifications fails
        await createLog(null, null, null, null, `Error fetching unread notifications: ${error.message}`, false);
        return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
};

export const markNotificationAsRead = async (req, res) => {
    const { notification_id } = req.body;

    try {
        if (!notification_id) {
            await createLog(null, null, null, null, 'Missing notification_id while marking as read', false);
            return res.status(400).json({ status: "error", message: "Missing notification_id" });
        }

        const query = `
            UPDATE notification 
            SET was_read = TRUE 
            WHERE notification_id = $1
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [notification_id]);

        if (rows.length === 0) {
            await createLog(null, null, null, null,  `Notification not found for ID: ${notification_id}`, false);
            return res.status(404).json({ status: "error", message: "Notification not found" });
        }

        await createLog(null, null, null, null, `Notification marked as read: ${notification_id}`, true);
        return res.status(200).json({ status: "success", notification: rows[0] });
    } catch (error) {
        await createLog(null, null, null, null,  `Error marking notification as read: ${error.message}`, false);
        return res.status(500).json({ status: "error", message: "Failed to update notification" });
    }
};
