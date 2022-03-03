// import { extractUserFromToken } from "../config/jwt.config";
import { AppRequest } from "../config/jwt.config";
import { Response, NextFunction } from "express";

function auth(
  req: AppRequest,
  res: Response,
  next: NextFunction,
) {
  const token: string = req.cookies.jwt || req.token;
  console.log({ tokenAuth: token });
  console.log(req.cookies);

  if (!token) {
    res.status(401).send("Not authorized...");
  } else next();
}
export default auth;
