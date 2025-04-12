import jwt from "jsonwebtoken";
import dotenv from "dotenv"

export const generateTokenandCookie = (res, userID) => {

    dotenv.config();

    const token = jwt.sign({ userID }, process.env.JWT_SECRET, {
        expiresIn: "7d", 
    });

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "strict", // Protect against CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return token;
}