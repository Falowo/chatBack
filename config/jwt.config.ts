import jwt from "jsonwebtoken";
import jwtDecode from "jwt-decode";
import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { User } from "../models/User";
dotenv.config();
const secret = process.env.SECRET_KEY;
// const userBan = ['12341234'];

export interface Payload {
  user: User;
  exp: number;
  iat?: number;
}

export interface Locals {
  user: User;
  token: string;
  isAuthenticated: boolean;
}

export interface AppRequest extends Request {
  token?: string;
  user?: User;
  isAuthenticated?: () => boolean;
  logout?: () => void;
  login?: (user: User) => void;
}

export const createJwtToken = (user: User) => {
  const jwtToken: string = jwt.sign(
    {
      user,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    },
    secret,
  );

  return jwtToken;
};

export const checkIfTokenNotExpired = (
  payload: Payload,
): boolean | string => {
  const tokenExp: number = payload.exp;
  const nowInSec = Math.floor(Date.now() / 1000);
  if (
    nowInSec < tokenExp &&
    tokenExp - nowInSec > 60 * 60 * 12
  ) {
    return true;
  } else if (
    nowInSec < tokenExp &&
    tokenExp - nowInSec < 60 * 60 * 12
    // * 12
  ) {
    const user = payload.user;
    const refreshedToken = createJwtToken(user);

    return refreshedToken;
  } else {
    throw new Error("token expired");
  }
};

export const extractUserFromToken = async (
  req: AppRequest,
  res: Response,
  next: NextFunction,
) => {
  let token: string = req.header("x-auth-token");
  const { oldToken } = req.body;
  let tokenSentFromBodyToRefresh: boolean =
    oldToken === token;

  if (!!token) {
    try {
      jwt.verify(token, secret, {
        ignoreExpiration: true,
      });
      let payload: Payload = jwtDecode(token);

      try {
        const refreshedToken =
          checkIfTokenNotExpired(payload);
        // console.log({ refreshedToken });

        if (typeof refreshedToken === "string") {
          if (!!tokenSentFromBodyToRefresh) {
            req.user = payload.user;
            req.token = refreshedToken;
            res.status(200).json(refreshedToken);
          } else {
            req.user = payload.user;
            req.token = token;
            next();
          }
        } else if (refreshedToken === true) {
          req.user = payload.user;
          req.token = token;
          next();
        }
      } catch (e) {
        console.log(e);
        req.user = null;
        req.token = null;
        res.status(400).json("Invalid token...");
      }
    } catch (e) {
      console.log(e);
      req.user = null;
      req.token = null;
      res.status(400).json("Invalid token");
    }
  } else {
    console.log(` no req.header("x-auth-token")`);
    req.user = null;
    req.token = null;
    res.status(400).json("No token in header");
  }
};

export const addJwtFeatures = (
  req: AppRequest,
  _res: Response,
  next: NextFunction,
) => {

  req.isAuthenticated = () => !!req.user;
  req.logout = () => {
    req.user = null;
    req.token = null;
  };
  req.login = (user) => {
    const token = createJwtToken(user);
    console.log({ token });
    req.user = user;
    req.token = token;
  };
  console.log("addJwtFeatures");

  next();
};
