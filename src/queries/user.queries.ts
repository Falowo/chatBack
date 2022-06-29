import { UserModel } from "../database/models";

export const findUserPerId = (id) => {
  return UserModel.findById(id).exec();
};
