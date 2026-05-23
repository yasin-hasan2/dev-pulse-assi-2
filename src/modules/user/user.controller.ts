import type { Request, Response } from "express";
import userService from "./user.service";
import sendResponse from "../../utility/sendResponse";

const createUser = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  try {
    // role validation
    if (role && role !== "maintainer" && role !== "contributor") {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message:
          "Invalid role. Role must be either 'maintainer' or 'contributor'.",
        data: req.body,
      });
    }
    const result = await userService.createUserIntoDb(req.body);
    if (!result) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Failed to create user",
        data: req.body,
      });
    }

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User created successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: "User creation failed",
    });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await userService.getAllUsersFromDb();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Users fetched successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: "User fetching failed",
    });
  }
};

const getSingleUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await userService.getSingleUserFromDb(id as string);
    if (result.rows.length === 0) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "User not found",
        data: { id: parseInt(id as string) },
      });
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User fetched successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: "User fetching failed",
    });
  }
};
const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;
  try {
    // role validation
    if (role && role !== "maintainer" && role !== "contributor") {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message:
          "Invalid role. Role must be either 'maintainer' or 'contributor'.",
        data: req.body,
      });
    }
    const result = await userService.updateUserFromDb(req.body, id as string);
    if (result.rows.length === 0) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "User not found",
        data: { id: parseInt(id as string) },
      });
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: "User updating failed",
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await userService.deleteUserFromDb(id as string);
    if (!result) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "User not found",
        data: { id: parseInt(id as string) },
      });
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User deleted successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: "User deletion failed",
    });
  }
};

export default {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
};
