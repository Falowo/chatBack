import dotenv from "dotenv";
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
// dotenv.config();
// const uri = process.env.MONGODB_URI;
const port = process.env.PORT || 8800;
export const server = app.listen(port);

// console.log("MongoDB Connected");
// console.log(process.env.NODE_ENV);
// console.log(process.env.URL);

// if (process.env.NODE_ENV === "development") {
//   app.use(cors());
//   console.log("process.env.NODE_ENV === 'development'");

// } else if (process.env.NODE_ENV === "production") {
//   console.log("process.env.NODE_ENV === 'production'");

// app.use(cors({origin: process.env.URL}));

// }else{
//   console.log("process.env.NODE_ENV === 'production'");

//   // app.use(cors({origin: process.env.URL}));
//   app.use(cors());
// }
app.use(cors());

app.use(express.json());

import "./config/socket.io.config/";

if (process.env.NODE_ENV === "development") {
  dotenv.config();

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
  "/images",
  express.static(
    path.join(__dirname, "../../public/images"),
  ),
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
