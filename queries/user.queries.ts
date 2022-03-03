import { UserModel } from "../models/";

export const findUserPerId = (id) => {
  return UserModel.findById(id).exec();
};
