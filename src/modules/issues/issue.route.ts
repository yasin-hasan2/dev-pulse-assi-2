import { Router } from "express";
import auth from "../../middlewares/auth.middleware";
import { issueController } from "./issue.controller";
import requireMaintainer from "../../middlewares/role.middleware";

const router = Router();

router.post("/", auth(), issueController.createIssue);
router.get("/", auth(), issueController.getAllIssues);
router.get("/:id", auth(), issueController.getSingleIssue);
router.put("/:id", auth(), requireMaintainer, issueController.updateIssue);
router.delete("/:id", auth(), requireMaintainer, issueController.deleteIssue);

export const issueRouter = router;
