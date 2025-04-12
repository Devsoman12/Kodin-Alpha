import passport from "passport";
import { decodeSSOToken } from "../utils/decodeSSOToken.js";
import pool from "../db/connectDB.js"; // Ensure this points to your database connection
import { generateTokenandCookie } from "../utils/generateTokenAndCookies.js";

export const ssoLogin = passport.authenticate("openidconnect");

export const ssoCallback = (req, res, next) => {
    passport.authenticate("openidconnect", { failureRedirect: "http://localhost:3000/" }, async (err, user) => {
        if (err) {
            return res.redirect("http://localhost:3000/");
        }

        if (!user) {
            return res.redirect("http://localhost:3000/");
        }


        req.logIn(user, async (loginErr) => {
            if (loginErr) {
                return next(loginErr);
            }

            try {
                const decoded = decodeSSOToken(user.accessToken);
                const nick = decoded.preferred_username;
                const email = decoded.email;
                const accessToken = user.accessToken;

                const existingUser = await pool.query(
                    "SELECT user_id FROM userR WHERE email = $1 OR nick = $2",
                    [email, nick]
                );

                let userId;
                if (existingUser.rows.length === 0) {

                    // Determine user role based on email
                    const studentRegex = /^[a-zA-Z0-9._%+-]+@student\.tuke\.sk$/;
                    const teacherRegex = /^[a-zA-Z0-9._%+-]+@tuke\.sk$/;

                    let role;
                    if (studentRegex.test(email)) {
                        role = "student";
                    } else if (teacherRegex.test(email)) {
                        role = "teacher";
                    } else {
                        return res.status(400).json({ status: "false", message: "Invalid email format." });
                    }

                    // Insert new user
                    const result = await pool.query(
                        `INSERT INTO userR (email, nick, role, registration_date, last_login_date, honor, isVerified, selected_badge_id, rank_id)
                         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, true, 1, 1)
                         RETURNING user_id`,
                        [email, nick, role]
                    );

                    userId = result.rows[0].user_id;

                    // Create default lists
                    await pool.query(
                        `INSERT INTO listoftask (user_id, name) VALUES ($1, 'Created Tasks'), ($1, 'Completed Tasks')`,
                        [userId]
                    );

                } else {
                    userId = existingUser.rows[0].user_id;
                }

                generateTokenandCookie(res, userId);

                res.redirect("http://localhost:3000/");
            } catch (error) {
                res.redirect("http://localhost:3000/");
            }
        });
    })(req, res, next);
};


