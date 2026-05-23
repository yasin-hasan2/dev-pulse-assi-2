import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db/dbConnections";
import sendResponse from "../utility/sendResponse";
const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return sendResponse(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized: No token provided",
        });
      }
      const decoded = jwt.verify(
        token as string,
        config.jwtSecret,
      ) as JwtPayload;
      const userData = await pool.query(
        `
        SELECT * FROM users WHERE email = $1
      `,
        [decoded.email],
      );
      if (userData.rows.length === 0) {
        return sendResponse(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized: User not found",
        });
      }
      const user = userData.rows[0];

      req.user = user;
      next();
    } catch (error: any) {
      sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized: Invalid token",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
};

export default auth;
