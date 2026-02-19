import { Router } from "express";
import { authController } from "../controllers/auth.controller";

const router = Router();

// Public auth endpoints
router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));
router.post("/logout", (req, res) => authController.logout(req, res));

router.post("/login-child", (req, res) => authController.loginChild(req, res));

// Verify token (utility)
router.post("/verify-token", (req, res) => authController.verifyToken(req, res));

// Admin/Protected endpoints (protected - require JWT, user context passed via headers)
router.get("/parents", (req, res) => authController.getParents(req, res));
router.get("/children", (req, res) => authController.getChildren(req, res));
router.get("/children/:id", (req, res) => authController.getChildById(req, res));

// parent dashboard endpoints
router.get("/parent/:id", (req, res) => authController.getParentById(req, res));

// create child profile endpoint
router.post("/create-child-profile", (req, res) =>
  authController.createChildProfile(req, res)
);


export default router;