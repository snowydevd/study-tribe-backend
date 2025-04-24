require("../lib/firebase")

const { getAuth } = require('firebase/auth');
const auth = getAuth();

const verifyToken = async (req, res, next) => {
  try {
    // Check for authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Missing or invalid authorization header:', authHeader);
      return res.status(401).json({ error: "No auth token provided" });
    }

    // Extract and verify token
    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('No token found in authorization header');
      return res.status(401).json({ error: "Invalid token format" });
    }

    // Verify the token and decode user info
    const decodedToken = await auth.verifyIdToken(token);
    
    // Attach user info to request object
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = { verifyToken };