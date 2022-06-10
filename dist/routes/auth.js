"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jwt_config_1 = require("../config/jwt.config");
const router = express_1.default.Router();
const signin_controller_1 = require("../controllers/authControllers/signin.controller");
const signup_controller_1 = require("../controllers/authControllers/signup.controller");
router.post("/signup", signup_controller_1.signup);
router.post("/signin", signin_controller_1.signin);
router.post("/refreshToken", jwt_config_1.extractUserFromToken);
exports.default = router;
//# sourceMappingURL=auth.js.map