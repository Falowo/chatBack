import { IUser } from "./user.interface";

enum Status {
  aborted = 0,
  pending = 10,
  sent = 20,
  received = 30,
  checked = 40,
}

export interface IMessage {
  _id?: string;
  conversationId: string;
  senderId: string;
  receivedByIds: string[];
  checkedByIds: string[];
  status?: Status;
  text?: string;
  img?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface IPMessage {
  _id?: string;
  conversationId: string;
  senderId: IUser;
  receivedByIds: string[];
  checkedByIds: string[];
  status?: Status;
  text?: string;
  img?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
