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
exports.Message = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const User_1 = require("./User");
const Conversation_1 = require("./Conversation");
let Message = class Message {
};
__decorate([
    (0, typegoose_1.prop)({
        ref: () => Conversation_1.Conversation,
        required: true,
    }),
    __metadata("design:type", Object)
], Message.prototype, "conversationId", void 0);
__decorate([
    (0, typegoose_1.prop)({
        ref: () => User_1.User,
        required: true,
    }),
    __metadata("design:type", Object)
], Message.prototype, "senderId", void 0);
__decorate([
    (0, typegoose_1.prop)({
        required: true,
    }),
    __metadata("design:type", String)
], Message.prototype, "text", void 0);
__decorate([
    (0, typegoose_1.prop)({
        enum: [0, 10, 20, 30, 40],
        default: 1,
    }),
    __metadata("design:type", Number)
], Message.prototype, "status", void 0);
__decorate([
    (0, typegoose_1.prop)({
        ref: () => User_1.User,
    }),
    __metadata("design:type", Array)
], Message.prototype, "receivedByIds", void 0);
__decorate([
    (0, typegoose_1.prop)({
        ref: () => User_1.User,
    }),
    __metadata("design:type", Array)
], Message.prototype, "checkedByIds", void 0);
Message = __decorate([
    (0, typegoose_1.modelOptions)({
        schemaOptions: {
            timestamps: true,
        },
    })
], Message);
exports.Message = Message;
//# sourceMappingURL=Message.js.map