import {  Response } from "express";
import { AppRequest } from "../../config/jwt.config";
export const logout = (
  req: AppRequest,
  res: Response,
) => {
  req.token = undefined;
  req.user = undefined;
  res.status(200).json(req.user);
};
