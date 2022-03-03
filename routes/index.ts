import express from "express";
const router = express.Router();

// import signin from "./signin";
// import signup from "./signup";
import auth from "./auth";
import posts from "./posts";
import users from "./users";
import messages from "./messages";
import conversations from "./conversations";
import { addJwtFeatures, extractUserFromToken } from "../config/jwt.config";
// import authMiddleware from "../middleware/auth";

// router.use("/signin", signin);
// router.use("/signup", signup);
router.use("/auth", auth);
router.use(
  "/users",
  extractUserFromToken,
  addJwtFeatures,
  users,
);
router.use(
  "/posts",
  extractUserFromToken,
  addJwtFeatures,
  posts,
);
router.use(
  "/conversations",
  extractUserFromToken,
  addJwtFeatures,
  conversations,
);
router.use(
  "/messages",
  extractUserFromToken,
  addJwtFeatures,
  messages,
);

export default router;
