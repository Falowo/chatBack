import Joi from "joi";
import { createJwtToken } from "../../config/jwt.config";
import { Response } from "express";
import { AppRequest } from "../../config/jwt.config";
import { User } from "../../models/User";
import { UserModel } from "../../models/";

const schema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().min(3).max(200).email().required(),
  password: Joi.string().min(6).max(200).required(),
});

export const signup = async (
  req: AppRequest,
  res: Response,
) => {
  const { username, email, password } = req.body;
  console.log({ username, email, password });
  const { error } = schema.validate(req.body);
  if (error) {
    console.log({ username });
    res.status(400).send(error.details[0].message);
  } else {
    try {
      let user = await UserModel.findOne({
        email,
      });
      console.log({ user });

      if (user) {
        res
          .status(400)
          .send("User with that email already exist...");
      } else {
        user = new UserModel({
          username,
          email,
          password,
        });

        user.password = await User.hashPassword(
          user.password,
        );

        await user.save();

        const token = createJwtToken(user);

        req.login(user);
        console.log("login function executed");
        console.log(res.locals);
        res.status(200).json(token);
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
};
