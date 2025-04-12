import jwt from "jsonwebtoken";
import { decodeToken } from "../utils/decodeToken.js";


export const authenticateUser = async (req, res, next) => {
  try {
    const { userID } = await decodeToken(req);
    req.userID = userID; // Attach userID to the request for further use
    next();

  } catch (error) {

    res.status(401).json({ success: false, message: error.message });

  }
};
