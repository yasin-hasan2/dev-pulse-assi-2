import { pool } from "../../db/dbConnections";
import type { IIssue } from "./issue.interface";

const createIssueIntoDb = async (payload: IIssue) => {
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
      [title, description, type, payload.reporter_id],
    );
    const issue = result.rows[0];

    const reporterResult = await pool.query(
      `
        SELECT id, name, role 
        FROM users 
        WHERE id = $1
        `,
      [issue.reporter_id],
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
        ...reporter,
      },
    };
  } catch (error) {
    console.error("Error creating issue in database:", error);
    throw new Error("Database error");
  }
};

const getAllIssuesFromDb = async () => {
  try {
    const result = await pool.query(
      `SELECT * FROM issues ORDER BY created_at DESC`,
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching issues from database:", error);
    throw new Error("Database error");
  }
};

const getSingleIssueFromDb = async (id: string) => {
  try {
    const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
      id,
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
      [issue.reporter_id],
    );

    const { reporter_id, ...cleanIssue } = issue;
    return {
      ...cleanIssue,
      reporter: reporterResult.rows[0] || null,
    };
  } catch (error: any) {
    console.error("Error fetching issue from database:", error);
    throw new Error("Database error");
  }
};

const updateIssueInDb = async (id: string, payload: IIssue) => {
  const { title, description, type, status } = payload;
  if (!title && !description && !type && !status) {
    throw new Error(
      "At least one field (title, description, type, status) must be provided for update",
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
      [title, description, type, status, id],
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error updating issue in database:", error);
    throw new Error("Database error");
  }
};

const deleteIssueFromDb = async (id: string) => {
  try {
    const result = await pool.query(
      "DELETE FROM issues WHERE id = $1 RETURNING *",
      [id],
    );
    return result.rows[0];
  } catch (error: any) {
    console.error("Error deleting issue from database:", error);
    throw new Error("Database error");
  }
};

export const issueService = {
  createIssueIntoDb,
  getAllIssuesFromDb,
  getSingleIssueFromDb,
  updateIssueInDb,
  deleteIssueFromDb,
};
