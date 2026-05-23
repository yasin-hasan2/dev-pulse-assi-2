import { pool } from "../../db/dbConnections";
import type { IUser } from "./user.interface";
import bcrypt from "bcrypt";

const createUserIntoDb = async (payload: IUser) => {
  const { name, email, password } = payload;

  const role =
    payload.role && payload.role.trim() !== "" && payload.role !== null
      ? payload.role
      : "contributor";

  const hashedPassword = await bcrypt.hash(password, 10);

  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required");
  }

  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, COALESCE($4, 'contributor')) RETURNING *`,
      [name, email, hashedPassword, role],
    );
    delete result.rows[0].password; // Remove password from the returned user object
    return result.rows[0]; // Return the created user without the password
  } catch (error: any) {
    console.error("Error creating user in database:", error);
    throw new Error("Database error");
  }
};

const getAllUsersFromDb = async () => {
  try {
    const result = await pool.query("SELECT * FROM users");
    return result.rows;
  } catch (error: any) {
    console.error("Error fetching users from database:", error);
    throw new Error("Database error");
  }
};

const getSingleUserFromDb = async (id: string) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result;
  } catch (error: any) {
    console.error("Error fetching user from database:", error);
    throw new Error("Database error");
  }
};

const updateUserFromDb = async (payload: IUser, id: string) => {
  const { name, email, password } = payload;
  const role =
    typeof payload.role === "string" && payload.role.trim() !== ""
      ? payload.role
      : undefined;
  const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
  if (name === "" || email === "" || password === "") {
    throw new Error(
      "Fields cannot be empty strings. Provide valid values for name, email, and password.",
    );
  }

  try {
    const result = await pool.query(
      `
    UPDATE users
    SET
      name = COALESCE($1, name),
      email = COALESCE($2, email),
      password = COALESCE($3, password),
      role = COALESCE($4, role),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING *
  `,
      [name, email, hashedPassword, role, id],
    );
    delete result.rows[0].password;
    return result;
  } catch (error: any) {
    console.error("Error updating user in database:", error);
    throw new Error("Database error");
  }
};

const deleteUserFromDb = async (id: string) => {
  try {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return null; // User not found
    }
    return result;
  } catch (error: any) {
    console.error("Error deleting user from database:", error);
    throw new Error("Database error");
  }
};

export default {
  createUserIntoDb,
  getAllUsersFromDb,
  getSingleUserFromDb,
  updateUserFromDb,
  deleteUserFromDb,
};
