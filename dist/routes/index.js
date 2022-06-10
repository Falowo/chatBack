"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_1 = __importDefault(require("./auth"));
const posts_1 = __importDefault(require("./posts"));
const users_1 = __importDefault(require("./users"));
const messages_1 = __importDefault(require("./messages"));
const conversations_1 = __importDefault(require("./conversations"));
const jwt_config_1 = require("../config/jwt.config");
router.use("/auth", auth_1.default);
router.use("/users", jwt_config_1.extractUserFromToken, jwt_config_1.addJwtFeatures, users_1.default);
router.use("/posts", jwt_config_1.extractUserFromToken, jwt_config_1.addJwtFeatures, posts_1.default);
router.use("/conversations", jwt_config_1.extractUserFromToken, jwt_config_1.addJwtFeatures, conversations_1.default);
router.use("/messages", jwt_config_1.extractUserFromToken, jwt_config_1.addJwtFeatures, messages_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map