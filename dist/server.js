

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";
import "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connectionString: process.env.CONNECTION_STRING,
  port: process.env.PORT || 3e3,
  jwtSecret: process.env.JWT_SECRET
};
var config_default = config;

// src/middlewares/logger.ts
import fs from "fs";
import "express";
var logger = (req, res, next) => {
  const log = `
Method-> ${req.method}, - Time-> ${(/* @__PURE__ */ new Date()).toISOString()},- URL-> ${req.url}
`;
  fs.appendFile("logger.text", log, (err) => {
    if (err) {
      console.error("Error writing to log file:", err);
    }
  });
  next();
};
var logger_default = logger;

// src/modules/user/user.route.ts
import { Router } from "express";

// src/db/dbConnections.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: config_default.connectionString
});
var initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role VARCHAR(20) DEFAULT 'contributor',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
             );
      `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues (
              id SERIAL PRIMARY KEY,
              title VARCHAR(150) NOT NULL,
              description TEXT NOT NULL,
              type VARCHAR(20) NOT NULL
               CHECK (type IN ('bug', 'feature_request')),
              status VARCHAR(20) DEFAULT 'open'
              CHECK (status IN ('open', 'in_progress', 'resolved')),
              reporter_id INTEGER NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

// src/modules/user/user.service.ts
import bcrypt from "bcrypt";
var createUserIntoDb = async (payload) => {
  const { name, email, password } = payload;
  const role = payload.role && payload.role.trim() !== "" && payload.role !== null ? payload.role : "contributor";
  const hashedPassword = await bcrypt.hash(password, 10);
  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required");
  }
  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, COALESCE($4, 'contributor')) RETURNING *`,
      [name, email, hashedPassword, role]
    );
    delete result.rows[0].password;
    return result.rows[0];
  } catch (error) {
    console.error("Error creating user in database:", error);
    throw new Error("Database error");
  }
};
var getAllUsersFromDb = async () => {
  try {
    const result = await pool.query("SELECT * FROM users");
    result.rows.forEach((user) => delete user.password);
    return result.rows;
  } catch (error) {
    console.error("Error fetching users from database:", error);
    throw new Error("Database error");
  }
};
var getSingleUserFromDb = async (id) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result;
  } catch (error) {
    console.error("Error fetching user from database:", error);
    throw new Error("Database error");
  }
};
var updateUserFromDb = async (payload, id) => {
  const { name, email, password } = payload;
  const role = typeof payload.role === "string" && payload.role.trim() !== "" ? payload.role : void 0;
  const hashedPassword = password ? await bcrypt.hash(password, 10) : void 0;
  if (name === "" || email === "" || password === "") {
    throw new Error(
      "Fields cannot be empty strings. Provide valid values for name, email, and password."
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
      [name, email, hashedPassword, role, id]
    );
    delete result.rows[0].password;
    return result;
  } catch (error) {
    console.error("Error updating user in database:", error);
    throw new Error("Database error");
  }
};
var deleteUserFromDb = async (id) => {
  try {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return null;
    }
    return result;
  } catch (error) {
    console.error("Error deleting user from database:", error);
    throw new Error("Database error");
  }
};
var user_service_default = {
  createUserIntoDb,
  getAllUsersFromDb,
  getSingleUserFromDb,
  updateUserFromDb,
  deleteUserFromDb
};

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/user/user.controller.ts
var createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (role && role !== "maintainer" && role !== "contributor") {
      return sendResponse_default(res, {
        statusCode: 400,
        success: false,
        message: "Invalid role. Role must be either 'maintainer' or 'contributor'.",
        data: req.body
      });
    }
    const result = await user_service_default.createUserIntoDb(req.body);
    if (!result) {
      return sendResponse_default(res, {
        statusCode: 400,
        success: false,
        message: "Failed to create user",
        data: req.body
      });
    }
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User created successfully",
      data: result
    });
  } catch (error) {
    console.error("Error creating user:", error);
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: "User creation failed"
    });
  }
};
var getAllUsers = async (req, res) => {
  try {
    const result = await user_service_default.getAllUsersFromDb();
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Users fetched successfully",
      data: result
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: "User fetching failed"
    });
  }
};
var getSingleUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await user_service_default.getSingleUserFromDb(id);
    if (result.rows.length === 0) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "User not found",
        data: { id: parseInt(id) }
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "User fetched successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: "User fetching failed"
    });
  }
};
var updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;
  try {
    if (role && role !== "maintainer" && role !== "contributor") {
      return sendResponse_default(res, {
        statusCode: 400,
        success: false,
        message: "Invalid role. Role must be either 'maintainer' or 'contributor'.",
        data: req.body
      });
    }
    const result = await user_service_default.updateUserFromDb(req.body, id);
    if (result.rows.length === 0) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "User not found",
        data: { id: parseInt(id) }
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "User updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating user:", error);
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: "User updating failed"
    });
  }
};
var deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await user_service_default.deleteUserFromDb(id);
    if (!result) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "User not found",
        data: { id: parseInt(id) }
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "User deleted successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: "User deletion failed"
    });
  }
};
var user_controller_default = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser
};

// src/middlewares/user.validator.ts
var validateUser = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }
  next();
};
var userValidator = {
  validateUser
};

// src/middlewares/auth.middleware.ts
import jwt from "jsonwebtoken";
var auth = () => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized: No token provided"
        });
      }
      const decoded = jwt.verify(
        token,
        config_default.jwtSecret
      );
      const userData = await pool.query(
        `
        SELECT * FROM users WHERE email = $1
      `,
        [decoded.email]
      );
      if (userData.rows.length === 0) {
        return sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized: User not found"
        });
      }
      const user = userData.rows[0];
      req.user = user;
      next();
    } catch (error) {
      sendResponse_default(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized: Invalid token",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };
};
var auth_middleware_default = auth;

// src/modules/user/user.route.ts
var router = Router();
router.post("/signup", userValidator.validateUser, user_controller_default.createUser);
router.get("/", auth_middleware_default(), user_controller_default.getAllUsers);
router.get("/:id", user_controller_default.getSingleUser);
router.put("/:id", userValidator.validateUser, user_controller_default.updateUser);
router.delete("/:id", user_controller_default.deleteUser);
var userRouter = router;

// src/modules/auth/auth.route.ts
import { Router as Router2 } from "express";

// src/modules/auth/auth.service.ts
import bcrypt2 from "bcrypt";
import jwt2 from "jsonwebtoken";
var loginUserIntoDb = async (payload) => {
  const { email, password } = payload;
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  const userData = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email
  ]);
  const user = userData.rows[0];
  if (!user) {
    throw new Error("Invalid email or password");
  }
  const isPasswordValid = await bcrypt2.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
  const accessToken = jwt2.sign(jwtPayload, config_default.jwtSecret, {
    expiresIn: "1d"
  });
  return {
    accessToken,
    user: jwtPayload
  };
};
var authService = {
  loginUserIntoDb
};

// src/modules/auth/auth.controller.ts
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserIntoDb(req.body);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "Login failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
var authController = {
  loginUser
};

// src/modules/auth/auth.route.ts
var router2 = Router2();
router2.post("/login", authController.loginUser);
var authRouter = router2;

// src/modules/issues/issue.route.ts
import { Router as Router3 } from "express";

// src/modules/issues/issue.service.ts
var createIssueIntoDb = async (payload) => {
  const { title, description, type } = payload;
  console.log("Creating issue with payload:", payload);
  if (!title || !description || !type) {
    throw new Error("Title, description, type are required");
  }
  try {
    const result = await pool.query(
      `
        INSERT INTO issues (title, description, type,  reporter_id) 
        VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, description, type, payload.reporter_id]
    );
    const issue = result.rows[0];
    const reporterResult = await pool.query(
      `
        SELECT id, name, role 
        FROM users 
        WHERE id = $1
        `,
      [issue.reporter_id]
    );
    const reporter = reporterResult.rows[0];
    if (!reporter) {
      throw new Error("Reporter not found");
    }
    const { reporter_id, ...cleanIssue } = issue;
    return {
      ...cleanIssue,
      reporter: {
        id: reporter.id,
        ...reporter
      }
    };
  } catch (error) {
    console.error("Error creating issue in database:", error);
    throw new Error("Database error");
  }
};
var getAllIssuesFromDb = async () => {
  try {
    const result = await pool.query(
      `SELECT * FROM issues ORDER BY created_at DESC`
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching issues from database:", error);
    throw new Error("Database error");
  }
};
var getSingleIssueFromDb = async (id) => {
  try {
    const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
      id
    ]);
    if (issueResult.rows.length === 0) {
      throw new Error("Issue not found");
    }
    const issue = issueResult.rows[0];
    const reporterResult = await pool.query(
      `
        SELECT id, name, role 
        FROM users 
        WHERE id = $1
        `,
      [issue.reporter_id]
    );
    const { reporter_id, ...cleanIssue } = issue;
    return {
      ...cleanIssue,
      reporter: reporterResult.rows[0] || null
    };
  } catch (error) {
    console.error("Error fetching issue from database:", error);
    throw new Error("Database error");
  }
};
var updateIssueInDb = async (id, payload) => {
  const { title, description, type, status } = payload;
  if (!title && !description && !type && !status) {
    throw new Error(
      "At least one field (title, description, type, status) must be provided for update"
    );
  }
  try {
    const result = await pool.query(
      `
            UPDATE issues
            SET
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                type = COALESCE($3, type),
                status = COALESCE($4, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
            RETURNING *
             `,
      [title, description, type, status, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error updating issue in database:", error);
    throw new Error("Database error");
  }
};
var deleteIssueFromDb = async (id) => {
  try {
    const result = await pool.query(
      "DELETE FROM issues WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error deleting issue from database:", error);
    throw new Error("Database error");
  }
};
var issueService = {
  createIssueIntoDb,
  getAllIssuesFromDb,
  getSingleIssueFromDb,
  updateIssueInDb,
  deleteIssueFromDb
};

// src/modules/issues/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await issueService.createIssueIntoDb({
      ...req.body,
      reporter_id: userId
    });
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "Issue creation failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const result = await issueService.getAllIssuesFromDb();
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues fetched successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "Failed to fetch issues",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
var getSingleIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssueFromDb(id);
    if (!result) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        data: { id: parseInt(id) }
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue fetched successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "Failed to fetch issue",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
var updateIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.updateIssueInDb(id, req.body);
    if (!result) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        data: { id: parseInt(id) }
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "Failed to update issue",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
var deleteIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.deleteIssueFromDb(id);
    if (!result) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        data: { id: parseInt(id) }
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully"
      //   data: result,
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "Failed to delete issue",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
var issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/middlewares/role.middleware.ts
var requireMaintainer = (req, res, next) => {
  const user = req.user;
  if (!user || user.role !== "maintainer") {
    return res.status(403).json({ message: "Access denied. Maintainer role required." });
  }
  next();
};
var role_middleware_default = requireMaintainer;

// src/modules/issues/issue.route.ts
var router3 = Router3();
router3.post("/", auth_middleware_default(), issueController.createIssue);
router3.get("/", auth_middleware_default(), issueController.getAllIssues);
router3.get("/:id", auth_middleware_default(), issueController.getSingleIssue);
router3.put("/:id", auth_middleware_default(), role_middleware_default, issueController.updateIssue);
router3.delete("/:id", auth_middleware_default(), role_middleware_default, issueController.deleteIssue);
var issueRouter = router3;

// src/middlewares/globalError.middleware.ts
import "express";
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};
var globalError_middleware_default = globalErrorHandler;

// src/app.ts
import cors from "cors";
var app = express();
var port = config_default.port;
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(logger_default);
var corsOptions = {
  origin: "http://localhost:3000",
  // Allow requests from this origin
  methods: "GET,POST,PUT,DELETE",
  // Allowed HTTP methods
  allowedHeaders: "Content-Type,Authorization",
  // Allowed headers
  optionsSuccessStatus: 200
  // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
app.get("/", (req, res) => {
  res.status(200).json({
    message: " DevPulse Assignment 2 ",
    author: "Yasin Al Hasan",
    date: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.use("/api/auth", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/issues", issueRouter);
app.use(globalError_middleware_default);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
var app_default = app;

// src/server.ts
var main = async () => {
  app_default.listen(config_default.port, () => {
    initDB();
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map