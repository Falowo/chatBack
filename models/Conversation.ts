import {
  modelOptions,
  Ref,
  prop,
  mongoose,
} from "@typegoose/typegoose";
import { Message } from "./Message";
import { User } from "./User";

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
export class Conversation {
  public _id?: mongoose.Schema.Types.ObjectId;

  @prop({
    ref: () => User,
    required: true,
  })
  public membersId: Ref<User>[];

  @prop({
    ref: () => User,
    required: true,
  })
  public adminsId: Ref<User>[];

  @prop({
    required: function () {
      return this.membersId.length > 2;
    },
    minlength: 3,
    maxlength: 20,
    unique: true,
  })
  groupName?: string;

  @prop()
  public groupPicture?: string;

  
  @prop({
    ref: () => Message,
  })
  public lastMessageId?: Ref<Message>;
  
}
