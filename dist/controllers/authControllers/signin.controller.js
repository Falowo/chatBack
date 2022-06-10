"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signin = void 0;
const joi_1 = __importDefault(require("joi"));
const jwt_config_1 = require("../../config/jwt.config");
const models_1 = require("../../models");
const schema = joi_1.default.object({
    email: joi_1.default.string().min(3).max(200).email().required(),
    password: joi_1.default.string().min(6).max(200).required(),
});
const signin = async (req, res) => {
    const { error } = schema.validate(req.body);
    if (error) {
        console.log("schema not validate");
        res.status(400).send(error.details[0].message);
    }
    else {
        const { email, password } = req.body;
        console.log({ email, password });
        try {
            let user = await models_1.UserModel.findOne({ email });
            console.log({ user });
            if (!user) {
                res.status(400).send("invalid email...");
                return;
            }
            else {
                const validPassword = await user.comparePassword(password);
                if (!validPassword) {
                    res.status(400).send("invalid password...");
                    return;
                }
                else {
                    const token = (0, jwt_config_1.createJwtToken)(user);
                    req.user = user;
                    req.token = token;
                    console.log(`signedIn as ${user.username}`);
                    res.status(200).json(token);
                }
            }
        }
        catch (error) {
            console.log("error catched");
            res.status(500).send(error.message);
        }
    }
};
exports.signin = signin;
//# sourceMappingURL=signin.controller.js.map