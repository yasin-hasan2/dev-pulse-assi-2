import type { Request, Response, NextFunction } from "express";

const requireMaintainer = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || user.role !== "maintainer") {
    return res
      .status(403)
      .json({ message: "Access denied. Maintainer role required." });
  }
  next();
};

export default requireMaintainer;
