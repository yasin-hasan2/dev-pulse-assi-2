import { pool } from "../../db/dbConnections";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../../config";

const loginUserIntoDb = async (payload: {
  email: string;
  password: string;
}) => {
  const { email, password } = payload;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const userData = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);
  const user = userData.rows[0];
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
  const accessToken = jwt.sign(jwtPayload, config.jwtSecret, {
    expiresIn: "1d",
  });

  return {
    accessToken,
    user: jwtPayload,
  };
};

// const logoutUserFromDb = async (userId: string) => {
//   // Since JWT is stateless, we can't invalidate the token on the server side.
//   // To "logout" a user, the client should simply delete the token on their end.
//   // Optionally, you could implement a token blacklist in the database to invalidate tokens before their expiration.
//   return;
// }

export const authService = {
  loginUserIntoDb,
};
