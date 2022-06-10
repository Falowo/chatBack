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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var User_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const typegoose_1 = require("@typegoose/typegoose");
let User = User_1 = class User {
    static async hashPassword(password) {
        try {
            const salt = await bcrypt_1.default.genSalt(10);
            return bcrypt_1.default.hash(password, salt);
        }
        catch (e) {
            throw e;
        }
    }
    async comparePassword(password) {
        return bcrypt_1.default.compare(password, this.password);
    }
};
__decorate([
    (0, typegoose_1.prop)({
        require: true,
        minlength: 3,
        maxlength: 20,
        unique: true,
    }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, typegoose_1.prop)({
        required: true,
        maxlength: 50,
        unique: true,
    }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typegoose_1.prop)({
        required: true,
        minlength: 6,
    }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: String }),
    __metadata("design:type", String)
], User.prototype, "profilePicture", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: String }),
    __metadata("design:type", String)
], User.prototype, "coverPicture", void 0);
__decorate([
    (0, typegoose_1.prop)({
        ref: () => User_1,
    }),
    __metadata("design:type", Array)
], User.prototype, "followersIds", void 0);
__decorate([
    (0, typegoose_1.prop)({
        ref: () => User_1,
    }),
    __metadata("design:type", Array)
], User.prototype, "followedIds", void 0);
__decorate([
    (0, typegoose_1.prop)({
        ref: () => User_1,
    }),
    __metadata("design:type", Array)
], User.prototype, "friendRequestsFrom", void 0);
__decorate([
    (0, typegoose_1.prop)({
        ref: () => User_1,
    }),
    __metadata("design:type", Array)
], User.prototype, "notCheckedFriendRequestsFrom", void 0);
__decorate([
    (0, typegoose_1.prop)({
        ref: () => User_1,
    }),
    __metadata("design:type", Array)
], User.prototype, "notCheckedAcceptedFriendRequestsBy", void 0);
__decorate([
    (0, typegoose_1.prop)({
        ref: () => User_1,
    }),
    __metadata("design:type", Array)
], User.prototype, "friendRequestsTo", void 0);
__decorate([
    (0, typegoose_1.prop)({
        ref: () => User_1,
    }),
    __metadata("design:type", Array)
], User.prototype, "friends", void 0);
__decorate([
    (0, typegoose_1.prop)({
        ref: () => User_1,
    }),
    __metadata("design:type", Array)
], User.prototype, "blocked", void 0);
__decorate([
    (0, typegoose_1.prop)({
        default: false,
    }),
    __metadata("design:type", Boolean)
], User.prototype, "isAdmin", void 0);
__decorate([
    (0, typegoose_1.prop)({
        maxlength: 50,
    }),
    __metadata("design:type", String)
], User.prototype, "desc", void 0);
__decorate([
    (0, typegoose_1.prop)({
        maxlength: 50,
    }),
    __metadata("design:type", String)
], User.prototype, "city", void 0);
__decorate([
    (0, typegoose_1.prop)({
        maxlength: 50,
    }),
    __metadata("design:type", String)
], User.prototype, "from", void 0);
__decorate([
    (0, typegoose_1.prop)({
        enum: [1, 2, 3],
    }),
    __metadata("design:type", Number)
], User.prototype, "relationship", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Date)
], User.prototype, "birthDate", void 0);
User = User_1 = __decorate([
    (0, typegoose_1.modelOptions)({
        schemaOptions: {
            timestamps: true,
        },
    })
], User);
exports.User = User;
//# sourceMappingURL=User.js.map