import express, { Response } from "express";
// import mongoose from "mongoose";
import "./database";
import cors from "cors";
import path from "path";
import morgan from "morgan";
import index from "./routes/index";
import multer from "multer";
import { AppRequest } from "./config/jwt.config";

export const app = express();
const port = process.env.PORT || 8800;
export const server = app.listen(port);

if (process.env.NODE_ENV !== "production") {
  app.use(cors());
} else {
  app.use(
    cors({
      origin: [
        "https://astonishing-naiad-20ad9f.netlify.app",
      ],
    }),
  );
}
app.use(express.json());

import "./config/socket.io.config/";

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();

  app.use(morgan("dev"));
  // console.log(process.env.NODE_ENV);
}
// else if (process.env.NODE_ENV === "production") {
//   console.log(process.env.NODE_ENV);
// }

app.use(
  "/images",
  express.static(path.join(__dirname, "../public/images")),
);
app.use(
  "/videos",
  express.static(path.join(__dirname, "../public/videos")),
);
app.use(
  "/audios",
  express.static(path.join(__dirname, "../public/audios")),
);

const storage = multer.diskStorage({
  destination: (
    _req: AppRequest,
    _file: Express.Multer.File,
    callback: (error: Error, destination: string) => void,
  ) => {
    callback(
      null,
      path.join(__dirname, "../public/images"),
    );
  },
  filename: (
    req: AppRequest,
    _file: Express.Multer.File,
    callback: (error: Error, destination: string) => void,
  ) => {
    callback(null, req.body.name);
  },
});

const upload = multer({ storage });
app.post(
  "/api/upload",
  upload.single("file"),
  (_req: AppRequest, res: Response) => {
    try {
      res.status(200).json("File uploded successfully");
    } catch (error) {
      console.error(error);
    }
  },
);

app.use("/api/", index);
