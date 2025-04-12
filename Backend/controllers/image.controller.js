import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from "../db/connectDB.js"; 
import { createLog } from "../utils/createLog.js"; // Assuming createLog is your custom logger function

const uploadDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); 
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${Date.now()}.${fileExtension}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

export const uploadProfilePicture = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!req.file) {
      await createLog(user_id, null, null, null, 'No file uploaded for profile picture', false);
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const getQuery = 'SELECT profile_picture FROM userr WHERE user_id = $1';
    const getResult = await pool.query(getQuery, [user_id]);

    if (getResult.rowCount === 0) {
      await createLog(user_id, null, null, null, 'User not found for profile picture upload', false);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const currentProfilePic = getResult.rows[0].profile_picture;

    if (currentProfilePic) {
      let fileName = currentProfilePic;
      if (fileName.startsWith('/uploads/')) {
        fileName = fileName.replace('/uploads/', ''); 
      }

      const oldFilePath = path.join(uploadDir, fileName);

      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath); 
          await createLog(user_id, null, null, null, `Old profile picture deleted: ${fileName}`, true);
        } catch (error) {
          console.error('Error deleting file:', error);
          await createLog(user_id, null, null, null, `Error deleting old profile picture: ${fileName}`, false);
        }
      }
    }

    const filePath = `/uploads/${req.file.filename}`; 

    const updateQuery = 'UPDATE userr SET profile_picture = $1 WHERE user_id = $2 RETURNING profile_picture';
    const updateResult = await pool.query(updateQuery, [filePath, user_id]);

    if (updateResult.rowCount === 0) {
      await createLog(user_id, null, null, null, 'User not found while updating profile picture', false);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await createLog(user_id, null, null, null, `Profile picture uploaded successfully: ${filePath}`, true);
    res.json({ success: true, message: 'Profile picture uploaded', filePath });
  } catch (error) {
    await createLog(null, null, null, null, `Error uploading profile picture: ${error.message}`, false);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const uploadMiddleware = upload.single('profile_pic');

export const getProfilePicture = async (req, res) => {
  try {
    const { user_id } = req.body;

    const query = 'SELECT profile_picture FROM userr WHERE user_id = $1';
    const result = await pool.query(query, [user_id]);

    if (result.rowCount === 0) {
      await createLog(user_id, null, null, null, 'User not found while retrieving profile picture', false);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const profilePicture = result.rows[0].profile_picture;

    if (!profilePicture) {
      await createLog(user_id, 'No profile picture found for the user', false);
      return res.status(404).json({ success: false, message: 'No profile picture found' });
    }

    await createLog(user_id, null, null, null,  `Profile picture retrieved: ${profilePicture}`, true);
    res.json({ success: true, profilePicture });
  } catch (error) {
    await createLog(null, null, null, null, `Error retrieving profile picture: ${error.message}`, false);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getBadgePictures = async (req, res) => {
  try {
    const { user_id } = req.body;

    const userBadgesQuery = `
      SELECT 
        b.badge_id, 
        b.badge_picture, 
        b.badge_name, 
        CASE WHEN u.selected_badge_id = b.badge_id THEN true ELSE false END AS selected
      FROM badge b
      JOIN user_badge ub ON b.badge_id = ub.badge_id
      JOIN userR u ON u.user_id = ub.user_id
      WHERE ub.user_id = $1
    `;

    const userBadgesResult = await pool.query(userBadgesQuery, [user_id]);

    if (userBadgesResult.rowCount === 0) {
      await createLog(user_id, null, null, null, 'User has no assigned badges', false);
      return res.status(404).json({ success: false, message: 'User has no assigned badges' });
    }

    await createLog(user_id, null, null, null, 'User badges retrieved successfully', true);
    res.json({
      success: true,
      allBadges: userBadgesResult.rows.map(badge => ({
        badge_id: badge.badge_id,
        badge_name: badge.badge_name,
        badge_picture: `http://localhost:5000${badge.badge_picture}`,
        selected: badge.selected,
      }))
    });
  } catch (error) {
    await createLog(null, null, null, null, `Error retrieving user badge pictures: ${error.message}`, false);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
