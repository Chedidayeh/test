import { Router } from "express";
import { ChildrenController } from "../controllers/children.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Create child profile
router.post("/create-child-profile", (req, res) =>
  ChildrenController.createChild(req, res),
);

// Get all children with pagination
router.get("/children", (req, res) =>
  ChildrenController.getAllChildren(req, res),
);

// Get specific child by ID
router.get("/children/:id", (req, res) =>
  ChildrenController.getChildById(req, res),
);

// get children with parent ID
router.get("/children/parent/:parentId", (req, res) =>
  ChildrenController.getChildrenByParentId(req, res),
);

export default router;
