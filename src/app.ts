
import dotenv from "dotenv";
import express, { Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import morgan from "morgan";
import index from "./routes/index";
import multer from "multer";
import { AppRequest } from "./config/jwt.config";

const app = express();
dotenv.config();
const connection_string = process.env.CONNECTION_STRING;
const port = process.env.PORT || 8800;

if (process.env.NODE_ENV === "development") {
  app.use(cors({ origin: "http://localhost:3000" }));
} else if (process.env.NODE_ENV === "production") {
  app.use(cors({origin: "https://astonishing-naiad-20ad9f.netlify.app"}));
}

app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(process.env.NODE_ENV);
} else if (process.env.NODE_ENV === "production") {
  console.log(process.env.NODE_ENV);
}

app.use(
  "/images",
  express.static(path.join(__dirname, "../public/images")),
);

const storage = multer.diskStorage({
  destination: (
    _req: AppRequest,
    _file: Express.Multer.File,
    callback: (error: Error, destination: string) => void,
  ) => {
    callback(null, path.join(__dirname, "../public/images"));
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

export const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

import { InitSocketServer } from "./config/socket.io.config/";

mongoose
  .connect(connection_string)
  .then(() => {
    console.log("MongoDB Connected");
    console.log(process.env.NODE_ENV);
    console.log(process.env.URL);
  })
  .catch((error) => {
    console.error(
      `connection MongoDb failed : error : ${error}`,
    );
  });

InitSocketServer();
