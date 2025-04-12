import jwt from "jsonwebtoken";
import pool from "../db/connectDB.js"; // Import PostgreSQL pool instance

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwFvXCDFfdVkvxqmJ5hT3
tk46el4GzyanysPbMo0OLANO9LHO2PxvCPZ4aM+QV3Y9/d6zyny/ec0I7gkvUA4W
bVVBU2L3vqEgpfwoX2zlgDLmddZu4hn/irErJEsp1ssAHIISM/R5VuSq5lnzmMSF
Q/caNfiEXsxXAr6Ee/AHKOYQXPmiehwuK0INmIps6uvzm1fVDcsaK4P/2Z02hVor
j1jGaKKkhD9/vTzmhKXj9db+gkszgGYVAg6J2KgLygUFtFPPiMF0EQ3SwJQy3Yg1
6o+P+bLYCt3+MXdu8jc+HSEjQJdrqB3FaIz8+cOOOs6sZ/sSmN6eORE+QblCPxI7
cQIDAQAB
-----END PUBLIC KEY-----`;

export const decodeToken = async (req) => {
    const token = req.cookies?.token || req.cookies?.sso_token;
    const isSSO = !!req.cookies?.sso_token;

    if(token){
        try {
            const decode = isSSO
                ? jwt.verify(token, PUBLIC_KEY, { algorithms: ["RS256"] })
                : jwt.verify(token, process.env.JWT_SECRET);
            let userID = decode.userID;

            if (!userID && decode.email) {
                const { rows } = await pool.query("SELECT user_id FROM userr WHERE email = $1", [decode.email]);
                if (rows.length === 0) {
                    throw new Error("User not found in database");
                }
                userID = rows[0].user_id;
            }

            const decoded = {userID};

            return decoded;
        } catch (error) {
            throw new Error(`Invalid ${isSSO ? "SSO" : "Standard"} token`);
        }
    }else{
        const decoded = null;
        return decoded;
    }
};
