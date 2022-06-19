import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

import {
  modelOptions,
  Ref,
  prop,
} from "@typegoose/typegoose";

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
export class User {
  public _id?: mongoose.Schema.Types.ObjectId;
  public createdAt?: Date;
  public updatedAt?: Date;

  @prop({
    require: true,
    minlength: 3,
    maxlength: 20,
    unique: true,
  })
  public username: String;

  @prop({
    required: true,
    maxlength: 50,
    unique: true,
    validate: {
      validator: (v) => {
        return validator.isEmail(v);
      },
      message: "Invalid email.",
    },
  })
  public email: String;

  @prop({
    required: true,
    minlength: 6,
  })
  public password: String;

  @prop({ type: String })
  public profilePicture?: String;

  @prop({ type: String })
  public coverPicture?: String;

  @prop({
    ref: () => User,
  })
  public followersIds?: Ref<User>[];

  @prop({
    ref: () => User,
  })
  public followedIds?: Ref<User>[];

  @prop({
    ref: () => User,
  })
  public friendRequestsFrom?: Ref<User>[];

  @prop({
    ref: () => User,
  })
  public notCheckedFriendRequestsFrom?: Ref<User>[];

  @prop({
    ref: () => User,
  })
  public notCheckedAcceptedFriendRequestsBy?: Ref<User>[];

  @prop({
    ref: () => User,
  })
  public friendRequestsTo?: Ref<User>[];

  @prop({
    ref: () => User,
  })
  public friends?: Ref<User>[];

  @prop({
    ref: () => User,
  })
  public blocked?: Ref<User>[];

  @prop({
    default: false,
  })
  public isAdmin: boolean;

  @prop({
    maxlength: 50,
  })
  public desc?: String;

  @prop({
    maxlength: 50,
  })
  public city?: String;

  @prop({
    maxlength: 50,
  })
  public from?: String;

  @prop({
    enum: [1, 2, 3],
  })
  public relationship?: Number;

  @prop()
  public birthDate?: Date;

  static async hashPassword(password) {
    try {
      const salt = await bcrypt.genSalt(10);
      return bcrypt.hash(password, salt);
    } catch (e) {
      throw e;
    }
  }

  async comparePassword(password) {
    return bcrypt.compare(password, this.password);
  }
}
