import { AppRequest } from "./jwt.config";
import { Response, NextFunction } from "express";

export const ensureAuthenticated = (
  req: AppRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send("User not authenticated");
  }
};
