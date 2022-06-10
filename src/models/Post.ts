import {
  modelOptions,
  mongoose,
  prop,
  Ref,
} from "@typegoose/typegoose";
import { User } from "./User";

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
export class Post {
  public _id?: mongoose.Schema.Types.ObjectId;

  public createdAt?: Date;

  @prop({
    ref: () => User,
    required: true,
  })
  public userId: Ref<User>;

  @prop({
    maxlength: 500,
  })
  public desc?: string;

  @prop()
  public img?: string;

  @prop({
    ref: () => User,
  })
  public likersId?: Ref<User>[];

  @prop({
    ref: () => User,
  })
  public onTheWallOf?: Ref<User>;
}
