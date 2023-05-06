import { User } from "./User";
import {Message} from "./Message";
import { Conversation } from "./Conversation";
import { getModelForClass } from "@typegoose/typegoose";

export const UserModel = getModelForClass(User);
export const MessageModel = getModelForClass(Message);
export const ConversationModel = getModelForClass(Conversation);

