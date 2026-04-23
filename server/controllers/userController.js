import * as userService from "../services/userService.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({ success: false, message: "All fields are required" });
  }
  const result = await userService.signUp(name, email, password);
  if (!result.success) {
    return res.json({ success: false, message: result.message });
  }
  const token = jwt.sign(
    { id: result.data.id, name: result.data.name, email: result.data.email },
    process.env.JWT_TOKEN,
  );
  res.json({ success: true, data: result.data, token });
};

export const signin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ success: false, message: "All fields are required" });
  }
  const result = await userService.signIn(email, password);
  if (!result.success) {
    return res.json({ success: false, message: result.message });
  }
  const token = jwt.sign(
    { id: result.data.id, name: result.data.name, email: result.data.email },
    process.env.JWT_TOKEN,
  );
  res.json({ success: true, data: result.data, token });
};
