"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationModel = exports.MessageModel = exports.PostModel = exports.UserModel = void 0;
const User_1 = require("./User");
const Post_1 = require("./Post");
const Message_1 = require("./Message");
const Conversation_1 = require("./Conversation");
const typegoose_1 = require("@typegoose/typegoose");
exports.UserModel = (0, typegoose_1.getModelForClass)(User_1.User);
exports.PostModel = (0, typegoose_1.getModelForClass)(Post_1.Post);
exports.MessageModel = (0, typegoose_1.getModelForClass)(Message_1.Message);
exports.ConversationModel = (0, typegoose_1.getModelForClass)(Conversation_1.Conversation);
//# sourceMappingURL=index.js.map