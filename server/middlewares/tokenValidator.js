import jwt from "jsonwebtoken";

const tokenValidator = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ success: false, message: "Token not found" });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_TOKEN);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error("Token validation failed:", err.message);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export default tokenValidator;
