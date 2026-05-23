import fs from "fs";
import { type NextFunction, type Request, type Response } from "express";

const logger = (req: Request, res: Response, next: NextFunction) => {
  // console.log(`${req.method} ${req.url}`);
  // console.log("Time:", new Date().toISOString());
  // method -> time -> url
  const log = `\nMethod-> ${req.method}, - Time-> ${new Date().toISOString()},- URL-> ${req.url}\n`;
  fs.appendFile("logger.text", log, (err) => {
    if (err) {
      console.error("Error writing to log file:", err);
    }
  });
  next();
};

export default logger;
