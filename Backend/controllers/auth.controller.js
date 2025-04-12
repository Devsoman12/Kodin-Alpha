import { sendVerificationEmail, sendPasswordResetEmail, sendResetSuccessfulEmail } from "../mailSender/emailHandlre.js";
import { generateTokenandCookie} from "../utils/generateTokenAndCookies.js";
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import { getUserStats } from "../utils/getUserStats.js"; 
import bcrypt from 'bcryptjs';
import { decodeToken } from "../utils/decodeToken.js";
import crypto from 'crypto';
import pool from "../db/connectDB.js"; 
import { createLog } from "../utils/createLog.js";

export const signUp = async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    const logMessage = "Missing required fields for sign up: " + JSON.stringify(req.body);
    createLog(null, null, null, null, logMessage, false);
    return res.status(400).json({ status: "false", message: "Missing required fields" });
  }

  // Validate email format
  const studentRegex = /^[a-zA-Z0-9._%+-]+@student\.tuke\.sk$/;
  const teacherRegex = /^[a-zA-Z0-9._%+-]+@tuke\.sk$/;

  let role;
  if (studentRegex.test(email)) {
    role = "student";
  } else if (teacherRegex.test(email)) {
    role = "teacher";
  } else {
    const logMessage = `Invalid email format during sign up: ${email}`;
    createLog(null, null, null, null, logMessage, false);
    return res.status(400).json({ status: "false", message: "Invalid email format. Must be @student.tuke.sk or @tuke.sk" });
  }

  try {
    const existingUser = await pool.query(
      `SELECT * FROM userR WHERE email = $1 OR nick = $2`,
      [email, name]
    );

    if (existingUser.rows.length > 0) {
      const logMessage = `User with email or nickname already exists: ${email}, ${name}`;
      createLog(null, null, null, null, logMessage, false);
      return res.status(409).json({ status: "false", message: "Email or nickname already in use" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const VERIFICATION_CODE = generateVerificationCode();
    const EXPIRATION_TIME = new Date(Date.now() + 2 * 60 * 1000);

    // Insert the new user into the database
    const result = await pool.query(
      `INSERT INTO userR (email, nick, password, role, registration_date, last_login_date, honor, verificationcode, expirationTime, isVerified, selected_badge_id, rank_id)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, $5, $6, false, 1, 1)
       RETURNING user_id`,
      [email, name, hashedPassword, role, VERIFICATION_CODE, EXPIRATION_TIME]
    );
    
    const userId = result.rows[0].user_id;

    await pool.query(
      `INSERT INTO listoftask (user_id, name) VALUES ($1, 'Created Tasks'), ($1, 'Completed Tasks')`,
      [userId]
    );

    generateTokenandCookie(res, userId);
    sendVerificationEmail(email, VERIFICATION_CODE);

    const logMessage = `User registered successfully: ${userId}, ${email}`;
    createLog(userId, null, null, null, logMessage, true);
    res.status(201).json({
      status: "success",
      message: "User registered successfully. Please check your email to verify your account.",
    });
  } catch (error) {
    const logMessage = `Error registering user: ${error.message}`;
    createLog(null, null, null, null, logMessage, false);
    res.status(500).json({ status: "false", message: "Error registering user" });
  }
};

export const verifyCode = async (req, res) => {
  const { code } = req.body;
  const { userID } = await decodeToken(req);

  if (!code || code.length !== 4) {
    const logMessage = `Invalid verification code received: ${code}, userID: ${userID}`;
    createLog(userID, null, null, null, logMessage, false);
    return res.status(400).json({ status: "false", message: "Invalid verification code" });
  }

  try {
    const result = await pool.query(
      `SELECT verificationcode, expirationTime
       FROM userR 
       WHERE expirationTime > CURRENT_TIMESTAMP AND user_id = $1`,
      [userID] 
    );

    if (result.rows.length === 0) {
      const logMessage = `Verification code expired or invalid for userID: ${userID}`;
      createLog(userID, null, null, null, logMessage, false);
      return res.status(400).json({ status: "false", message: "Code expired or invalid." });
    }

    const { verificationcode: storedCode } = result.rows[0];

    if (storedCode != code) {
      const logMessage = `Invalid verification code provided for userID: ${userID}, expected: ${storedCode}, received: ${code}`;
      createLog(userID, null, null, null, logMessage, false);
      return res.status(400).json({ status: "false", message: "Invalid verification code" });
    }

    await pool.query(
      `UPDATE userR 
       SET verificationcode = NULL, 
           expirationTime = NULL, 
           isVerified = TRUE 
       WHERE user_id = $1`,
      [userID]
    );

    const logMessage = `Verification successful for userID: ${userID}`;
    createLog(userID, null, null, null, logMessage, true);
    res.status(200).json({ status: "success", message: "Verification successful and user status updated." });
  } catch (error) {
    const logMessage = `Error verifying code: ${error.message}, userID: ${userID}`;
    createLog(userID, null, null, null, logMessage, false);
    res.status(500).json({ status: "false", message: "Error verifying code" });
  }
};

export const logout = async (req, res) => {
  req.logout((err) => {
    if (err) {
      const logMessage = `Error during logout: ${err.message}`;
      createLog(null, null, null, null, logMessage, false);
      return res.status(500).json({ status: "false", message: "Logout failed" });
    }

    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        const logMessage = `Session destruction failed: ${err.message}`;
        createLog(null, null, null, null, logMessage, false);
        return res.status(500).json({ status: "false", message: "Session destruction failed" });
      }

      res.clearCookie("token");
      res.clearCookie("sso_token");
      res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: true,
        secure: false
      });

      createLog(null, null, null, null, "LogOut success", true);

      res.status(200).json({ status: "success", message: "Logout successful" });
    });
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const logMessage = `Missing fields for login: ${JSON.stringify(req.body)}`;
    createLog(null, null, null, null, logMessage, false);
    return res.status(400).json({ status: "false", message: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `SELECT user_id, password, isVerified, nick FROM userR WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      const logMessage = `Invalid login attempt, no user found with email: ${email}`;
      createLog(null, null, null, null, logMessage, false);
      return res.status(401).json({ status: "false", message: "Invalid email or password" });
    }

    const { user_id, password: hashedPassword, isverified, nick } = result.rows[0];

    if (!isverified) {
      const logMessage = `Account not verified for userID: ${user_id}`;
      createLog(user_id, null, null, null, logMessage, false);
      return res.status(403).json({ status: "false", message: "Account not verified" });
    }

    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (!isMatch) {
      const logMessage = `Invalid login attempt, incorrect password for userID: ${user_id}`;
      createLog(user_id, null, null, null, logMessage, false);
      return res.status(401).json({ status: "false", message: "Invalid email or password" });
    }

    const { problems_completed, comments_count, mostUsedLanguage } = await getUserStats(user_id);

    const userResult = await pool.query(
      `SELECT email, isverified, nick, honor, role FROM userR WHERE user_id = $1`,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      const logMessage = `User not found during login for userID: ${user_id}`;
      createLog(user_id, null, null, null, logMessage, false);
      return res.status(400).json({ status: "false", message: "User not found" });
    }

    const { email: userEmail, isverified: userIsVerified, nick: userNick, honor, role } = userResult.rows[0];
    const fullUser = { userID: user_id, email: userEmail, nick: userNick, isverified: userIsVerified, role: role, honor, problems_completed, comments_count, mostUsedLanguage };

    generateTokenandCookie(res, user_id);
    createLog(user_id, null, null, null, "Login successful", true);
    res.status(200).json({ status: "success", message: "Login successful", user: fullUser });
  } catch (error) {
    const logMessage = `Error during login: ${error.message}`;
    createLog(null, null, null, null, logMessage, false);
    res.status(500).json({ status: "false", message: "Error logging in" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const userID = req.userID;
    const { problems_completed, comments_count, mostUsedLanguage } = await getUserStats(userID);

    const result = await pool.query(
      `SELECT email, isverified, nick, honor, role, 
              contributor_flag, mentor_flag, verifier_flag, bug_hunter_flag 
       FROM userR WHERE user_id = $1`,
      [userID]
    );

    if (result.rows.length === 0) {
      const logMessage = `CheckAuth error, user not found: ${userID}`;
      createLog(userID, null, null, null, logMessage, false);
      return res.status(400).json({ status: "false", message: "User not found" });
    }

    const {
      email, isverified, nick, honor, role,
      contributor_flag, mentor_flag, verifier_flag, bug_hunter_flag
    } = result.rows[0];

    const user = {
      userID,
      email,
      nick,
      isverified,
      honor,
      role,
      problems_completed,
      comments_count,
      mostUsedLanguage,
      contributor_flag,
      mentor_flag,
      verifier_flag,
      bug_hunter_flag
    };

    createLog(userID, null, null, null, `CheckAuth OK for user: ${nick}`, true);

    res.status(200).json({ status: "success", user });
  } catch (error) {
    const logMessage = `Error in CheckAuth: ${error.message}`;
    createLog(null, null, null, null, logMessage, false);
    res.status(400).json({ status: "false", message: error.message });
  }
};

export const sendAgainVerificationEmail = async (req, res) => {
  try {
    const { userID } = await decodeToken(req);
    if (!userID) {
      createLog(null, null, null, null, "User ID is required for verification email", false); // Log failed attempt
      return res.status(400).json({ status: "false", message: "User ID is required" });
    }

    const VERIFICATION_CODE = generateVerificationCode();
    const EXPIRATION_TIME = new Date(Date.now() + 2 * 60 * 1000); // Expire in 2 minutes

    const query = `
      UPDATE userr
      SET verificationcode = $1, expirationtime = $2
      WHERE user_id = $3;
    `;

    const values = [VERIFICATION_CODE, EXPIRATION_TIME, userID];
    const result = await pool.query(query, values);

    const response = await pool.query(
      `SELECT isVerified, nick, email
       FROM userR 
       WHERE user_id = $1`,
      [userID]
    );

    const { isverified, nick, email } = response.rows[0];

    if (result.rowCount === 0) {
      createLog(userID, null, null, null, "User not found while sending verification email", false); // Log when user not found
      return res.status(404).json({ status: "false", message: "User not found" });
    }

    sendVerificationEmail(email, VERIFICATION_CODE);
    createLog(userID, null, null, null, `Verification email sent to ${email}`, true); // Log successful email sending

    const { user } = { userID, email, nick, isverified };

    res.status(200).json({
      status: "true",
      message: "Verification email sent successfully",
      user,
    });
  } catch (error) {
    createLog(null, null, null, null, `Error sending verification email: ${error.message}`, false); // Log error
    res.status(400).json({ status: "false", message: error.message });
  }
};


export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const queryText = 'SELECT * FROM userr WHERE email = $1'; // Adjust the table name as needed
    const result = await pool.query(queryText, [email]);

    if (!result.rows.length) {
      createLog(null, null, null, null, `User with email ${email} not found during forgot password request`, false); // Log failed attempt
      return res.status(401).json({ status: false, message: "User not found." });
    }

    const user = result.rows[0];

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;

    const updateQuery = 'UPDATE userr SET resetToken = $1, resetTokenExpires = $2 WHERE email = $3';
    await pool.query(updateQuery, [resetToken, resetTokenExpires, email]);

    await sendPasswordResetEmail(user.email, `${process.env["CLIENT_URL "]}/reset-password/${resetToken}`);

    createLog(user.user_id, null, null, null, `Password reset link sent to email: ${user.email}`, true); // Log successful password reset email sending
    res.status(200).json({ status: true, message: "Password reset link sent to your email" });

  } catch (error) {
    createLog(null, null, null, null, `Error during forgot password process: ${error.message}`, false); // Log error
    res.status(400).json({ status: false, message: "Error sending reset password email" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const queryText = 'SELECT * FROM userr WHERE resetToken = $1 AND resetTokenExpires > NOW()';
    const result = await pool.query(queryText, [token]);

    if (!result.rows.length) {
      createLog(null, null, null, null, `Invalid or expired reset token: ${token}`, false); // Log invalid token attempt
      return res.status(400).json({ status: false, message: "Invalid or expired reset token" });
    }

    const userEmail = result.rows[0].email;
    console.log(userEmail);

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatePasswordQuery = `
      UPDATE userr
      SET password = $1,
          resetToken = NULL,
          resetTokenExpires = NULL
      WHERE email = $2
    `;
    await pool.query(updatePasswordQuery, [hashedPassword, userEmail]);

    await sendResetSuccessfulEmail(userEmail);

    createLog(null, null, null, null, `Password reset successfully for email: ${userEmail}`, true);
    
    res.status(200).json({ status: true, message: "Password reset successful" });

  } catch (error) {
    createLog(null, null, null, null, `Error in reset password process: ${error.message}`, false); // Log error
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const getUserProfileStats = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      createLog(null, null, null, null, "User ID is required in getUserProfileStats", false); // Log missing user_id
      return res.status(400).json({ status: "false", message: "User ID is required" });
    }

    const { problems_completed, comments_count, mostUsedLanguage } = await getUserStats(user_id);

    const result = await pool.query(
      `SELECT email, isverified, nick, honor, role FROM userR WHERE user_id = $1`,
      [user_id]
    );

    if (result.rows.length === 0) {
      createLog(user_id, null, null, null, "User not found in getUserProfileStats", false); // Log user not found
      return res.status(400).json({ status: "false", message: "User not found" });
    }

    const { email, isverified, nick, honor, role } = result.rows[0];

    const userProfile = {
      userID: user_id,
      email,
      nick,
      isverified,
      honor,
      role,
      problems_completed,
      comments_count,
      mostUsedLanguage,
    };

    createLog(user_id, null, null, null, `User profile stats fetched successfully`, true); // Log successful fetch
    res.status(200).json({ status: "success", userProfile });
  } catch (error) {
    createLog(null, null, null, null `Error in getUserProfileStats: ${error.message}`, false); // Log error
    res.status(400).json({ status: "false", message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { userID } = await decodeToken(req);
    const { username, email, password, profileVisibility } = req.body;

    if (!username || !email || !password) {
      createLog(userID, null, null, null, "All fields are required for profile update", false); // Log missing fields
      return res.status(400).json({ status: "false", message: 'All fields are required' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const updateQuery = `
      UPDATE userr
      SET nick = $1, email = $2, password = $3, visibility = $4
      WHERE user_id = $5
      RETURNING *;
    `;
    const updateValues = [username, email, hashedPassword, profileVisibility, userID];

    const updateResult = await pool.query(updateQuery, updateValues);

    if (updateResult.rowCount === 0) {
      createLog(userID, null, null, null, "User not found during profile update", false); // Log user not found
      return res.status(404).json({ status: "false", message: 'User not found' });
    }

    createLog(userID, null, null, null, "Profile updated successfully", true); // Log successful profile update
    res.json({ status: "success", message: 'Profile updated successfully', data: updateResult.rows[0] });
  } catch (error) {
    createLog(null, null, null, null, `Error updating profile: ${error.message}`, false); // Log error
    res.status(500).json({ status: "false", message: 'Server error' });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { userID } = await decodeToken(req);

    const checkUserQuery = 'SELECT * FROM userr WHERE user_id = $1';
    const userCheckResult = await pool.query(checkUserQuery, [userID]);

    if (userCheckResult.rowCount === 0) {
      createLog(userID, null, null, null, "User not found during account deletion", false); // Log user not found
      return res.status(404).json({ status: "false", message: 'User not found' });
    }

    const deleteQuery = 'DELETE FROM userr WHERE user_id = $1';
    const deleteResult = await pool.query(deleteQuery, [userID]);

    if (deleteResult.rowCount === 0) {
      createLog(userID, null, null, null, "Failed to delete account", false); // Log deletion failure
      return res.status(500).json({ status: "false", message: 'Failed to delete account' });
    }

    createLog(userID, null, null, null, "Account deleted successfully", true); // Log account deletion success
    res.json({ status: "success", message: 'Account deleted successfully' });
  } catch (error) {
    createLog(null, null, null, null, `Error deleting account: ${error.message}`, false); // Log error
    res.status(500).json({ status: "false", message: 'Server error' });
  }
};
