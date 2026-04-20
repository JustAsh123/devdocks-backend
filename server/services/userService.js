import { pool } from "../db.js";
import bcrypt from "bcrypt";

const exists = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows.length > 0;
};

export const signUp = async (name, email, password) => {
  if (await exists(email))
    return { success: false, message: "User already exists" };
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) returning *",
    [name, email, hashedPassword],
  );
  console.log(result);
  if (result.rows.rowCount === 0)
    return { success: false, message: "User not created" };
  return { success: true, data: result.rows[0] };
};

export const signIn = async (email, password) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  if (result.rows.length === 0)
    return { success: false, message: "User not found" };
  const isPasswordValid = await bcrypt.compare(
    password,
    result.rows[0].password,
  );
  if (!isPasswordValid) return { success: false, message: "Invalid password" };
  return { success: true, data: result.rows[0] };
};
