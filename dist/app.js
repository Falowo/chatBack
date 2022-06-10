"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const morgan_1 = __importDefault(require("morgan"));
const index_1 = __importDefault(require("./routes/index"));
const multer_1 = __importDefault(require("multer"));
const app = (0, express_1.default)();
const connection_string = process.env.CONNECTION_STRING;
const port = process.env.PORT || 8800;
app.use((0, cors_1.default)({ origin: "http://localhost:3000" }));
app.use(express_1.default.json());
if ((process.env.NODE_ENV === "development")) {
    app.use((0, morgan_1.default)("dev"));
    app.use("/images", express_1.default.static(path_1.default.join(__dirname, "/public/images")));
    console.log(process.env.NODE_ENV);
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, path_1.default.join(__dirname, "/public/images"));
    },
    filename: (req, _file, callback) => {
        callback(null, req.body.name);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
app.post("/api/upload", upload.single("file"), (_req, res) => {
    try {
        res.status(200).json("File uploded successfully");
    }
    catch (error) {
        console.error(error);
    }
});
app.use("/api/", index_1.default);
if (process.env.NODE_ENV === "production") {
    app.use("/images", express_1.default.static(path_1.default.join(__dirname, "/public/images")));
    console.log(process.env.NODE_ENV);
    app.get("*", (_req, res) => {
        res.sendFile(path_1.default.join(__dirname, "../../front/build/index.html"));
    });
}
exports.server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
const socket_io_config_1 = require("./config/socket.io.config/");
mongoose_1.default
    .connect(connection_string)
    .then(() => {
    console.log("MongoDB Connected");
})
    .catch((error) => {
    console.error(`connection MongoDb failed : error : ${error}`);
});
(0, socket_io_config_1.InitSocketServer)();
//# sourceMappingURL=app.js.map