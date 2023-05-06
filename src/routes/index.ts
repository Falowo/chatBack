import express from "express";
const router = express.Router();


import auth from "./auth";
import users from "./users";
import messages from "./messages";
import conversations from "./conversations";
import { addJwtFeatures, extractUserFromToken } from "../config/jwt.config";

router.use("/auth", auth);
router.use(
  "/users",
  extractUserFromToken,
  addJwtFeatures,
  users,
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
