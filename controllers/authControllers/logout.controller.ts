import { NextFunction, Response } from "express";
import { AppRequest } from "../../config/jwt.config";
export const logout = (
  req: AppRequest,
  res: Response,
  next: NextFunction,
) => {
  req.token = null;
  req.user = null;
  next();
};
