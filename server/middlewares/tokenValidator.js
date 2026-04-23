import jwt from "jsonwebtoken";

const tokenValidator = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.json({ status: false, message: "Token not found" });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_TOKEN);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.log(err);
    res.json({ status: false, message: "Invalid token" });
  }
};

export default tokenValidator;
