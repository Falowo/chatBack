"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addJwtFeatures = exports.extractUserFromToken = exports.checkIfTokenNotExpired = exports.createJwtToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_decode_1 = __importDefault(require("jwt-decode"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const secret = process.env.SECRET_KEY;
const createJwtToken = (user) => {
    const jwtToken = jsonwebtoken_1.default.sign({
        user,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    }, secret);
    return jwtToken;
};
exports.createJwtToken = createJwtToken;
const checkIfTokenNotExpired = (payload) => {
    const tokenExp = payload.exp;
    const nowInSec = Math.floor(Date.now() / 1000);
    if (nowInSec < tokenExp &&
        tokenExp - nowInSec > 60 * 60 * 12) {
        return true;
    }
    else if (nowInSec < tokenExp &&
        tokenExp - nowInSec < 60 * 60 * 12) {
        const user = payload.user;
        const refreshedToken = (0, exports.createJwtToken)(user);
        return refreshedToken;
    }
    else {
        throw new Error("token expired");
    }
};
exports.checkIfTokenNotExpired = checkIfTokenNotExpired;
const extractUserFromToken = async (req, res, next) => {
    let token = req.header("x-auth-token");
    const { oldToken } = req.body;
    let tokenSentFromBodyToRefresh = oldToken === token;
    if (!!token) {
        try {
            jsonwebtoken_1.default.verify(token, secret, {
                ignoreExpiration: true,
            });
            let payload = (0, jwt_decode_1.default)(token);
            try {
                const refreshedToken = (0, exports.checkIfTokenNotExpired)(payload);
                if (typeof refreshedToken === "string") {
                    if (!!tokenSentFromBodyToRefresh) {
                        req.user = payload.user;
                        req.token = refreshedToken;
                        res.status(200).json(refreshedToken);
                    }
                    else {
                        req.user = payload.user;
                        req.token = token;
                        next();
                    }
                }
                else if (refreshedToken === true) {
                    req.user = payload.user;
                    req.token = token;
                    next();
                }
            }
            catch (e) {
                console.log(e);
                req.user = null;
                req.token = null;
                res.status(400).json("Invalid token...");
            }
        }
        catch (e) {
            console.log(e);
            req.user = null;
            req.token = null;
            res.status(400).json("Invalid token");
        }
    }
    else {
        console.log(` no req.header("x-auth-token")`);
        req.user = null;
        req.token = null;
        res.status(400).json("No token in header");
    }
};
exports.extractUserFromToken = extractUserFromToken;
const addJwtFeatures = (req, _res, next) => {
    req.isAuthenticated = () => !!req.user;
    req.logout = () => {
        req.user = null;
        req.token = null;
    };
    req.login = (user) => {
        const token = (0, exports.createJwtToken)(user);
        console.log({ token });
        req.user = user;
        req.token = token;
    };
    console.log("addJwtFeatures");
    next();
};
exports.addJwtFeatures = addJwtFeatures;
//# sourceMappingURL=jwt.config.js.map