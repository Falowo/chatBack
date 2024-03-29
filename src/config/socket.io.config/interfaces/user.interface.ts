export interface IUser {
  token?: string;
  _id?: string;
  username: string;
  email?: string;
  password?: string;
  profilePicture?: string;
  coverPicture?: string;
  friendRequestsFrom?: string[];
  friendRequestsTo?: string[];
  friends?: string[];
  blocked?: string[];
  notCheckedFriendRequestsFrom?:string[];
  notCheckedAcceptedFriendRequestsBy?: string[];
  isAdmin?: boolean;
  desc?: string;
  city?: string;
  from?: string;
  relationship?: number;
  birthDate?: Date;
}
