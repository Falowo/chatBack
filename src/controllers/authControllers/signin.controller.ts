import Joi from "joi";
import { createJwtToken } from "../../config/jwt.config";
import { Response } from "express";
import { AppRequest } from "../../config/jwt.config";
import { UserModel } from "../../database/models";

const schema = Joi.object({
  email: Joi.string().min(3).max(200).email().required(),
  password: Joi.string().min(6).max(200).required(),
});

export const signin = async (
  req: AppRequest,
  res: Response,
  // next: NextFunction,
) => {
  const { error } = schema.validate(req.body);

  if (error) {
    console.log("schema not validate");
    res.status(400).send(error.details[0].message);
  } else {
    const { email, password } = req.body;
    console.log({ email, password });

    try {
      let user = await UserModel.findOne({ email });
      console.log({ user });
      if (!user) {
        res.status(400).send("invalid email...");
        return;
      } else {
        const validPassword = await user.comparePassword(
          password,
        );

        if (!validPassword) {
          res.status(400).send("invalid password...");
          return;
        } else {
          const token = createJwtToken(user);
          req.user = user;
          req.token = token;
          console.log(`signedIn as ${user.username}`);
          res.status(200).json(token);
        }
      }
    } catch (error) {
      console.log("error catched");
      res.status(500).send(error.message);
    }
  }
};
