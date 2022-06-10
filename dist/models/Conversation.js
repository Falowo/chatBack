"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const Message_1 = require("./Message");
const User_1 = require("./User");
let Conversation = class Conversation {
};
__decorate([
    (0, typegoose_1.prop)({
        ref: () => User_1.User,
        required: true,
    }),
    __metadata("design:type", Array)
], Conversation.prototype, "membersId", void 0);
__decorate([
    (0, typegoose_1.prop)({
        ref: () => User_1.User,
        required: true,
    }),
    __metadata("design:type", Array)
], Conversation.prototype, "adminsId", void 0);
__decorate([
    (0, typegoose_1.prop)({
        required: function () {
            return this.membersId.length > 2;
        },
        minlength: 3,
        maxlength: 20,
        unique: true,
    }),
    __metadata("design:type", String)
], Conversation.prototype, "groupName", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], Conversation.prototype, "groupPicture", void 0);
__decorate([
    (0, typegoose_1.prop)({
        ref: () => Message_1.Message,
    }),
    __metadata("design:type", Object)
], Conversation.prototype, "lastMessageId", void 0);
Conversation = __decorate([
    (0, typegoose_1.modelOptions)({
        schemaOptions: {
            timestamps: true,
        },
    })
], Conversation);
exports.Conversation = Conversation;
//# sourceMappingURL=Conversation.js.map