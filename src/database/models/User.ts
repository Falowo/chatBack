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
  public username: string;

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
  public email: string;

  @prop({
    required: true,
    minlength: 6,
  })
  public password: string;

  @prop()
  public profilePicture?: string;

  @prop()
  public coverPicture?: string;

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
  public desc?: string;

  @prop({
    maxlength: 50,
  })
  public city?: string;

  @prop({
    maxlength: 50,
  })
  public from?: string;

  @prop({
    enum: [1, 2, 3],
  })
  public relationship?: number;

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
