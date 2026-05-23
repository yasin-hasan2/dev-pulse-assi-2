import type { NextFunction, Request, Response } from "express";

const validateUser = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  next();
};

export const userValidator = {
  validateUser,
};
