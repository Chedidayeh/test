import { Router } from "express";
import { ChildrenController } from "../controllers/children.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// All children endpoints require authentication
// router.use(authMiddleware);

// Get all children with pagination
router.get("/children", (req, res) => ChildrenController.getAllChildren(req, res));

// Get specific child by ID
router.get("/children/:id", (req, res) => ChildrenController.getChildById(req, res));

export default router;
