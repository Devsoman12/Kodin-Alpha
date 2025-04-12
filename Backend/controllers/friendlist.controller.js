import pool from "../db/connectDB.js";
import {decodeToken} from "../utils/decodeToken.js";

export const addFriend = async (req, res) => {
    const { userID } = decodeToken(req);
    console.log("My ID: " + userID);

    const {
        user_id
    } = req.body;

    if (!user_id /*|| !userID*/) {
        console.log("Validation failed, missing required fields");
        return res.status(400).json({ status: "false", message: "Missing required fields" });
    }

    try {
        const userIDQuery = 'SELECT * FROM userr WHERE user_id = $1';
        const userIDResult = await pool.query(userIDQuery, [user_id]);

        if (userIDResult.rows.length <= 0) {
            return res.status(401).json({ status: "false", message: "User with this ID was not found in the database." });
        }

        const friendlistIDQuery = 'SELECT friend_list_id FROM friendlist WHERE user_id = $1';
        const friendlistIDResult = await pool.query(friendlistIDQuery, [userID]);

        if (friendlistIDResult.rows.length <= 0) {
            return res.status(401).json({ status: "false", message: "This user does not have friend list." });
        }
        const friendlistID = friendlistIDResult.rows[0].friend_list_id;
        console.log("Friend list ID: " + friendlistID);

        const alreadyExistingFriendship = 'SELECT * FROM friendship WHERE friend_list_id = $1 AND user_id = $2';
        const alreadyExistingFriendshipResult = await pool.query(alreadyExistingFriendship, [friendlistID, user_id]);

        if (alreadyExistingFriendshipResult.rows.length > 0) {
            return res.status(402).json({ status: "false", message: "This user is already in your friend list." });
        }

        const addFriendQuery = 'INSERT INTO friendship(friend_list_id, user_id) VALUES ($1, $2)';
        await pool.query(addFriendQuery, [friendlistID, user_id]);

        // Respond with success
        res.status(200).json({
            status: "success",
            message: "Friend added to friend list successfully.",
        });

    } catch (error) {
        console.error("Error while adding friends into friend list:", error.message);
        res.status(500).json({ status: "false", message: "Adding friend to friend list failed", error: error.message });
    }
}

export const getFriends = async (req, res) => {
    const { userID } = decodeToken(req);
    console.log("My ID: " + userID);

    try {
        const friendlistIDQuery = 'SELECT friend_list_id FROM friendlist WHERE user_id = $1';
        const friendlistIDResult = await pool.query(friendlistIDQuery, [userID]);

        if (friendlistIDResult.rows.length <= 0) {
            return res.status(401).json({ status: "false", message: "Friend list not found for this user." });
        }

        const friendlistID = friendlistIDResult.rows[0].friend_list_id;

        const getFriendsQuery = `
            SELECT u.user_id, u.nick, u.email 
            FROM userr u
            JOIN friendship f ON f.user_id = u.user_id
            WHERE f.friend_list_id = $1
        `;

        const friendsResult = await pool.query(getFriendsQuery, [friendlistID]);

        if (friendsResult.rows.length === 0) {
            return res.status(402).json({ status: "false", message: "No friends found in the list." });
        }

        res.status(200).json({
            status: "true",
            message: "Friends retrieved successfully.",
            friends: friendsResult.rows
        });

    } catch (error) {
        console.error("Error while retrieving friends:", error.message);
        res.status(500).json({ status: "false", message: "Error retrieving friends", error: error.message });
    }
};

export const removeFriend = async (req, res) => {
    const { userID } = decodeToken(req);
    console.log("My ID: " + userID);

    const { user_id } = req.body;

    if (!user_id) {
        console.log("Validation failed, missing required fields");
        return res.status(400).json({ status: "false", message: "Missing required fields" });
    }

    try {
        const friendlistIDQuery = 'SELECT friend_list_id FROM friendlist WHERE user_id = $1';
        const friendlistIDResult = await pool.query(friendlistIDQuery, [userID]);

        if (friendlistIDResult.rows.length <= 0) {
            return res.status(401).json({ status: "false", message: "Friend list not found for this user." });
        }

        const friendlistID = friendlistIDResult.rows[0].friend_list_id;

        const deleteFriendQuery = 'DELETE FROM friendship WHERE friend_list_id = $1 AND user_id = $2';
        const deleteResult = await pool.query(deleteFriendQuery, [friendlistID, user_id]);

        if (deleteResult.rowCount === 0) {
            return res.status(402).json({ status: "false", message: "Friend not found in your friend list." });
        }

        res.status(200).json({
            status: "success",
            message: "Friend removed from friend list successfully.",
        });

    } catch (error) {
        console.error("Error while removing friend from friend list:", error.message);
        res.status(500).json({ status: "false", message: "Removing friend from friend list failed", error: error.message });
    }
};