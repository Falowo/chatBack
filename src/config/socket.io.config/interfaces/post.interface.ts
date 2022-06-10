import { IUser } from "./user.interface";

export interface IPost {
  _id?: string;
  userId: string | IUser;
  desc?: string;
  img?: string;
  likersId: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
