import jwt from "jsonwebtoken";

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwFvXCDFfdVkvxqmJ5hT3
tk46el4GzyanysPbMo0OLANO9LHO2PxvCPZ4aM+QV3Y9/d6zyny/ec0I7gkvUA4W
bVVBU2L3vqEgpfwoX2zlgDLmddZu4hn/irErJEsp1ssAHIISM/R5VuSq5lnzmMSF
Q/caNfiEXsxXAr6Ee/AHKOYQXPmiehwuK0INmIps6uvzm1fVDcsaK4P/2Z02hVor
j1jGaKKkhD9/vTzmhKXj9db+gkszgGYVAg6J2KgLygUFtFPPiMF0EQ3SwJQy3Yg1
6o+P+bLYCt3+MXdu8jc+HSEjQJdrqB3FaIz8+cOOOs6sZ/sSmN6eORE+QblCPxI7
cQIDAQAB
-----END PUBLIC KEY-----`;

export const decodeSSOToken = (token) => {
  if (!token) {
    throw new Error("Unauthorized: no token provided");
  }

  try {
    const decoded = jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] });

    if (!decoded) {
      throw new Error("Invalid token");
    }

    return decoded;
  } catch (error) {
        console.log(error.message);
    }
};
