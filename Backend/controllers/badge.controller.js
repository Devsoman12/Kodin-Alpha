import pool from "../db/connectDB.js"; 
import { decodeToken } from "../utils/decodeToken.js";
import { createLog } from "../utils/createLog.js"; // Assuming createLog is your custom logger function

export const setUserBadge = async (req, res) => {
  const { user_id, selected_badge_id } = req.body;

  if (!user_id || !selected_badge_id) {
    await createLog(user_id, null, null, null, 'Invalid user_id or selected_badge_id', false);
    return res.status(400).json({ success: false, message: 'Invalid user_id or selected_badge_id' });
  }

  try {
    const checkBadgeQuery = `
      SELECT * FROM user_badge WHERE user_id = $1 AND badge_id = $2
    `;
    const checkBadgeResult = await pool.query(checkBadgeQuery, [user_id, selected_badge_id]);

    if (checkBadgeResult.rowCount === 0) {
      await createLog(user_id, null, null, null, 'User does not have this badge assigned', false);
      return res.status(400).json({ success: false, message: 'User does not have this badge assigned' });
    }

    const updateQuery = 'UPDATE userR SET selected_badge_id = $1 WHERE user_id = $2';
    await pool.query(updateQuery, [selected_badge_id, user_id]);

    await createLog(user_id, null, null, null, 'Selected badge updated successfully', true);
    res.json({ success: true, message: 'Selected badge updated successfully' });
  } catch (error) {
    await createLog(user_id, null, null, null, `Error setting selected badge: ${error.message}`, false);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateUserBadges = async (req, res) => {
  const { badge_names, user_id } = req.body;


  if (!user_id || !badge_names || !Array.isArray(badge_names) || badge_names.length === 0) {
    await createLog(user_id, null, null, null, 'Invalid user_id or badge_names', false);
    return res.status(400).json({ success: false, message: 'Invalid user_id or badge_names' });
  }

  try {
    const badgeNames = badge_names.map(name => name.toLowerCase());

    const badgeIdsQuery = `
      SELECT badge_id
      FROM badge
      WHERE LOWER(badge_name) = ANY($1)
    `;
    const badgeIdsResult = await pool.query(badgeIdsQuery, [badgeNames]);

    if (badgeIdsResult.rowCount === 0) {
      await createLog(user_id, null, null, null, 'No matching badges found', false);
      return res.status(404).json({ success: false, message: 'No matching badges found' });
    }

    const badgeIds = badgeIdsResult.rows.map(row => row.badge_id);

    const currentBadgesQuery = `
      SELECT badge_id
      FROM user_badge
      WHERE user_id = $1
    `;
    const currentBadgesResult = await pool.query(currentBadgesQuery, [user_id]);

    const currentBadgeIds = new Set(currentBadgesResult.rows.map(row => row.badge_id));

    const badgesToAdd = badgeIds.filter(id => !currentBadgeIds.has(id));
    const badgesToRemove = Array.from(currentBadgeIds).filter(id => !badgeIds.includes(id));

    if (badgesToAdd.length > 0) {
      const insertBadgeQuery = `
        INSERT INTO user_badge (user_id, badge_id)
        VALUES ($1, $2)
      `;
      for (let i = 0; i < badgesToAdd.length; i++) {
        await pool.query(insertBadgeQuery, [user_id, badgesToAdd[i]]);
      }
    }

    if (badgesToRemove.length > 0) {
      const deleteBadgeQuery = `
        DELETE FROM user_badge
        WHERE user_id = $1 AND badge_id = $2
      `;
      for (let i = 0; i < badgesToRemove.length; i++) {
        await pool.query(deleteBadgeQuery, [user_id, badgesToRemove[i]]);
      }
    }
    console.log(badgeNames);

    // Update user flags based on badge names (case-insensitive check)
    const contributor = badgeNames.map(name => name.toLowerCase()).includes('contributor');
    const mentor = badgeNames.map(name => name.toLowerCase()).includes('mentor');
    const verifier = badgeNames.map(name => name.toLowerCase()).includes('verifier');
    const bugHunter = badgeNames.map(name => name.toLowerCase()).includes('bug hunter');
    
    // Log the result to confirm
    console.log(contributor, mentor, verifier, bugHunter);
    const updateFlagsQuery = `
      UPDATE "userr"
      SET
        contributor_flag = $1,
        mentor_flag = $2,
        verifier_flag = $3,
        bug_hunter_flag = $4
      WHERE user_id = $5
    `;
    await pool.query(updateFlagsQuery, [contributor, mentor, verifier, bugHunter, user_id]);

    await createLog(user_id, null, null, null, 'Badges and flags updated successfully', true);
    res.json({ success: true, message: 'Badges and flags updated successfully' });

  } catch (error) {
    console.error('Error updating badges:', error);
    await createLog(user_id, null, null, null, `Error updating badges: ${error.message}`, false);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getUserBadges = async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    await createLog(user_id, null, null, null, 'Invalid user_id', false);
    return res.status(400).json({ success: false, message: 'Invalid user_id' });
  }

  try {
    const getUserBadgesQuery = `
      SELECT *
      FROM badge b
      INNER JOIN user_badge ub ON b.badge_id = ub.badge_id
      WHERE ub.user_id = $1
    `;
    
    const userBadgesResult = await pool.query(getUserBadgesQuery, [user_id]);
    
    if (userBadgesResult.rowCount === 0) {
      await createLog(user_id, null, null, null, 'No badges found for this user', false);
      return res.status(404).json({ success: false, message: 'No badges found for this user' });
    }
    
    await createLog(user_id, null, null, null, 'Badges retrieved successfully', true);
    res.json({ success: true, badges: userBadgesResult.rows });
  } catch (error) {
    console.error('Error retrieving user badges:', error);
    await createLog(user_id, null, null, null, `Error retrieving user badges: ${error.message}`, false);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
