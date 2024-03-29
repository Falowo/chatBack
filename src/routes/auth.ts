import express from "express";
import { extractUserFromToken } from "../config/jwt.config";
import { logout } from "../controllers/authControllers/logout.controller";
const router = express.Router();
import { signin } from "../controllers/authControllers/signin.controller";
import { signup } from "../controllers/authControllers/signup.controller";

//signUp
router.post("/signup", signup);

//signIn
router.post("/signin", signin);

router.post("/refreshToken", extractUserFromToken);

// logout
router.post("/logout", logout);

export default router;
