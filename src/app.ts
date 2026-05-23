import express, {
  type Application,
  type Request,
  type Response,
} from "express";

import { Pool } from "pg";
import config from "./config";
import logger from "./middlewares/logger";
import { userRouter } from "./modules/user/user.route";
import { authRouter } from "./modules/auth/auth.route";
import { issueRouter } from "./modules/issues/issue.route";
import globalErrorHandler from "./middlewares/globalError.middleware";
import cors from "cors";
const app: Application = express();
const port = config.port;

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(logger);
const corsOptions = {
  origin: "http://localhost:3000", // Allow requests from this origin
  methods: "GET,POST,PUT,DELETE", // Allowed HTTP methods
  allowedHeaders: "Content-Type,Authorization", // Allowed headers
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: " DevPulse Assignment 2 ",
    author: "Yasin Al Hasan",
    date: new Date().toISOString(),
  });
});

//
app.use("/api/auth", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/issues", issueRouter);

app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

export default app;
