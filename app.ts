import express, {  Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import morgan from "morgan";
import index from "./routes/index";
import multer from "multer";
dotenv.config();

const app = express();



app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use(morgan("dev"));

app.use(
  "/images",
  express.static(path.join(__dirname, "/public/images")),
);

import {
  AppRequest,
} from "./config/jwt.config";


const storage = multer.diskStorage({
  destination: (
    _req: AppRequest,
    _file: Express.Multer.File,
    callback: (error: Error, destination: string) => void,
  ) => {
    callback(null, path.join(__dirname, "/public/images"));
  },
  filename: (
    req: AppRequest,
    _file: Express.Multer.File,
    callback: (error: Error, destination: string) => void,
  ) => {
    callback(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
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

const connection_string = process.env.CONNECTION_STRING;
const port = process.env.PORT || 8800;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

mongoose
  .connect(connection_string)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.error(
      `connection MongoDb failed : error : ${error}`,
    );
  });
