"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = void 0;
const joi_1 = __importDefault(require("joi"));
const jwt_config_1 = require("../../config/jwt.config");
const User_1 = require("../../models/User");
const models_1 = require("../../models/");
const schema = joi_1.default.object({
    username: joi_1.default.string().min(3).max(30).required(),
    email: joi_1.default.string().min(3).max(200).email().required(),
    password: joi_1.default.string().min(6).max(200).required(),
});
const signup = async (req, res) => {
    const { username, email, password } = req.body;
    console.log({ username, email, password });
    const { error } = schema.validate(req.body);
    console.log({ error });
    if (error) {
        console.log({ username });
        res.status(400).send(error.details[0].message);
    }
    else {
        try {
            let user = await models_1.UserModel.findOne({
                email,
            });
            console.log({ user });
            if (user) {
                res
                    .status(400)
                    .send("User with that email already exist...");
            }
            else {
                user = new models_1.UserModel({
                    username,
                    email,
                    password,
                });
                user.password = await User_1.User.hashPassword(user.password);
                await user.save();
                const token = (0, jwt_config_1.createJwtToken)(user);
                req.user = user;
                console.log("login function executed");
                res.status(200).json(token);
            }
        }
        catch (error) {
            res.status(500).send(error.message);
        }
    }
};
exports.signup = signup;
//# sourceMappingURL=signup.controller.js.map