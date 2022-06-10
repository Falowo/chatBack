
import express from "express";
import { signup } from "../controllers/authControllers/signup.controller";
const router = express.Router();


router.post("/", signup);

export default router;
