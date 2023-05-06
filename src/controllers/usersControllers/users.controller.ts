import { Response } from "express";
import { AppRequest } from "../../config/jwt.config";
import {
  ConversationModel,
  MessageModel,
  UserModel,
} from "../../database/models";
import bcrypt from "bcrypt";
import { User } from "../../database/models/User";
import fs from "fs-extra";
import path from "path";

export const updateUserSensitiveDatas = async (
  req: AppRequest,
  res: Response,
) => {
  if (
    req.body.userId.toString() ===
      req.params.id.toString() ||
    req.body.isAdmin
  ) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(
          req.body.password,
          salt,
        );
      } catch (err) {
        res.status(500).json(err);
      }
    }
    try {
      await UserModel.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been updated");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res
      .status(403)
      .json("You can update only your account!");
  }
};

export const deleteUser = async (
  req: AppRequest,
  res: Response,
) => {
  if (
    req.body.userId.toString() ===
      req.params.id.toString() ||
    req.body.isAdmin
  ) {
    try {
      await UserModel.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res
      .status(403)
      .json("You can delete only your account!");
  }
};

export const getUser = async (
  req: AppRequest,
  res: Response,
) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await UserModel.findById(userId)
      : await UserModel.findOne({ username: username });
    const { password, updatedAt, ...other } = user;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getAllUsersMatchingSearch = async (
  req: AppRequest,
  res: Response,
) => {
  const search = req.params.search;
  function escapeRegExp(string) {
    return string.replaceAll(/[.*+?^${}()|[]\]/g, "$&");
  }
  const escapedSearch = escapeRegExp(search);
  const regExp = `^${escapedSearch}`;
  const reg = new RegExp(regExp, "ig");

  try {
    const users: User[] = await UserModel.find({
      username: { $regex: reg },
    });

    const lightUsers = users
      .map((u) => {
        const { _id, username, profilePicture } = u;
        return { _id, username, profilePicture };
      })
      .filter(
        (l) => l._id.toString() !== req.user._id.toString(),
      );

    res.status(200).json(lightUsers);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getBestCurrentUserFriends = async (
  req: AppRequest,
  res: Response,
) => {
  try {
    const conversations = await ConversationModel.find(
      {
        $and: [
          { membersId: { $in: [req.user._id] } },
          { membersId: { $size: 2 } },
        ],
      },
      "membersId _id",
    ).sort({ updatedAt: -1 });

    const conversationAndUser: {
      conversationId: string;
      memberId: string;
    }[] = conversations.flatMap((c) => ({
      memberId: c.membersId
        .map((mId) => mId.toString())
        .filter(
          (mId) => mId !== req.user._id.toString(),
        )[0],
      conversationId: c._id,
    }));

    const friendsAndMessagesNumber: {
      friendId: string;
      numberOfMessages: number;
    }[] = await Promise.all(
      conversationAndUser.map(async (c) => {
        const numberOfMessages = await MessageModel.find({
          conversationId: c.conversationId,
        }).count();

        return { friendId: c.memberId, numberOfMessages };
      }),
    );
    friendsAndMessagesNumber.sort((a, b) => {
      return b.numberOfMessages - a.numberOfMessages;
    });

    res.status(200).json(friendsAndMessagesNumber);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getFriendByUserIdParams = async (
  req: AppRequest,
  res: Response,
) => {
  try {
    const user: User = await UserModel.findById(
      req.params.userId,
    );

    const friends = await Promise.all(
      user.friends?.map((friendId) =>
        UserModel.findById(
          friendId,
          "_id username profilePicture",
        ),
      ),
    );
    res.status(200).json(friends);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getFriendRequestsFrom = async (
  req: AppRequest,
  res: Response,
) => {
  const currentUserId = req.user._id;
  const currentUser = await UserModel.findById(
    currentUserId,
  );
  try {
    const users = await Promise.all(
      currentUser.friendRequestsFrom?.map(async (fId) => {
        const f = await UserModel.findById(fId);
        const { _id, username, profilePicture } = f;
        return {
          _id,
          username,
          profilePicture,
        };
      }),
    );
    console.log({ friendRequestFrom: users });

    res.status(200).json(users);
  } catch (error) {
    res.status(400).json(error);
  }
};

export const sendFriendRequest = async (
  req: AppRequest,
  res: Response,
) => {
  const friendRequestId = req.params.friendRequestId;
  const currentUser = req.user;
  const friendRequestUser = await UserModel.findById(
    friendRequestId,
  );
  if (friendRequestUser) {
    if (
      !currentUser.friendRequestsTo
        ?.map((f) => f.toString())
        .includes(friendRequestId)
    ) {
      if (
        !currentUser.friends
          ?.map((f) => f.toString())
          .includes(friendRequestId)
      ) {
        if (
          !friendRequestUser.friendRequestsFrom
            ?.map((f) => f.toString())
            .includes(currentUser._id.toString())
        ) {
          if (
            !friendRequestUser.friends
              ?.map((f) => f.toString())
              .includes(currentUser._id.toString())
          ) {
            const updatedCurrentUser =
              await UserModel.findByIdAndUpdate(
                currentUser._id,
                {
                  $push: {
                    friendRequestsTo: friendRequestId,
                  },
                },
                { new: true },
              );
            const updatedFriendRequestUser =
              await UserModel.findByIdAndUpdate(
                friendRequestId,
                {
                  $push: {
                    friendRequestsFrom: currentUser._id,
                    notCheckedFriendRequestsFrom:
                      currentUser._id,
                  },
                },
                { new: true },
              );
            res.status(200).json({
              updatedCurrentUser,
              updatedFriendRequestUser,
            });
          } else {
            res.status(403).json({
              message:
                "you are already friend with this user",
            });
          }
        } else {
          res.status(403).json({
            message:
              "you already got friend request from this user",
          });
        }
      } else {
        res.status(403).json({
          message: "you are already friend with this user",
        });
      }
    } else {
      res.status(403).json({
        message:
          "you already sent friend request to this user",
      });
    }
  } else {
    res.status(404).json({ message: "user not found" });
  }
};

export const acceptFriendRequest = async (
  req: AppRequest,
  res: Response,
) => {
  const friendRequestId = req.params.friendRequestId;
  const currentUser = req.user;
  const friendRequestUser = await UserModel.findById(
    friendRequestId,
  );

  console.log({
    friendRequestUser,
    currentUser,
    friendRequestId,
  });

  if (friendRequestUser) {
    if (
      currentUser.friendRequestsFrom
        ?.map((f) => f.toString())
        .includes(friendRequestId)
    ) {
      if (
        !currentUser.friends
          ?.map((f) => f.toString())
          .includes(friendRequestId)
      ) {
        if (
          friendRequestUser.friendRequestsTo
            ?.map((f) => f.toString())
            .includes(currentUser._id.toString())
        ) {
          if (
            !friendRequestUser.friends
              ?.map((f) => f.toString())
              .includes(currentUser._id.toString())
          ) {
            const updatedCurrentUser =
              await UserModel.findByIdAndUpdate(
                currentUser._id,
                {
                  $push: {
                    friends: friendRequestId,
                  },
                  $pull: {
                    friendRequestsFrom: friendRequestId,
                  },
                },
                { new: true },
              );
            const updatedFriendRequestUser =
              await UserModel.findByIdAndUpdate(
                friendRequestId,
                {
                  $push: {
                    friends: currentUser._id,
                    notCheckedAcceptedFriendRequestsBy:
                      currentUser._id,
                  },
                  $pull: {
                    friendRequestsTo: currentUser._id,
                    notCheckedFriendRequestsFrom:
                      currentUser._id,
                  },
                },
                { new: true },
              );
            res.status(200).json({
              updatedCurrentUser,
              updatedFriendRequestUser,
            });
          } else {
            res.status(403).json({
              message:
                "you are already friend with this user 0",
            });
          }
        } else {
          res.status(403).json({
            message:
              "you already got friend request from this user 1",
          });
        }
      } else {
        res.status(403).json({
          message: "you are already friend with this user 2",
        });
      }
    } else {
      res.status(403).json({
        message:
          "you already sent friend request to this user 3",
      });
    }
  } else {
    res.status(404).json({ message: "user not found" });
  }
};

export const declineFriendRequest = async (
  req: AppRequest,
  res: Response,
) => {
  const friendRequestId = req.params.friendRequestId;
  const currentUser = req.user;
  const friendRequestUser = await UserModel.findById(
    friendRequestId,
  );
  if (friendRequestUser) {
    if (
      currentUser.friendRequestsFrom
        ?.map((f) => f.toString())
        .includes(friendRequestId)
    ) {
      if (
        !currentUser.friends
          ?.map((f) => f.toString())
          .includes(friendRequestId)
      ) {
        if (
          friendRequestUser.friendRequestsTo
            ?.map((f) => f.toString())
            .includes(currentUser._id.toString())
        ) {
          if (
            !friendRequestUser.friends
              ?.map((f) => f.toString())
              .includes(currentUser._id.toString())
          ) {
            const updatedCurrentUser =
              await UserModel.findByIdAndUpdate(
                currentUser._id,
                {
                  $pull: {
                    friendRequestsFrom: friendRequestId,
                  },
                },
                { new: true },
              );
            const updatedFriendRequestUser =
              await UserModel.findByIdAndUpdate(
                friendRequestId,
                {
                  $pull: {
                    friendRequestsTo: currentUser._id,
                  },
                },
                { new: true },
              );
            res.status(200).json({
              updatedCurrentUser,
              updatedFriendRequestUser,
            });
          } else {
            res.status(403).json({
              message:
                "you are already friend with this user",
            });
          }
        } else {
          res.status(403).json({
            message:
              "you already got friend request from this user",
          });
        }
      } else {
        res.status(403).json({
          message: "you are already friend with this user",
        });
      }
    } else {
      res.status(403).json({
        message:
          "you already sent friend request to this user",
      });
    }
  } else {
    res.status(404).json({ message: "user not found" });
  }
};

export const removeFriend = async (
  req: AppRequest,
  res: Response,
) => {
  if (
    req.user._id.toString() !== req.params.id.toString()
  ) {
    try {
      const exFriend = await UserModel.findByIdAndUpdate(
        req.params.id,
        {
          $pull: { friends: req.user._id },
        },
        { new: true },
      );
      const currentUser = await UserModel.findByIdAndUpdate(
        req.user._id,
        { $pull: { friends: req.params.id } },
        { new: true },
      );
      res.status(200).json({ exFriend, currentUser });
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res
      .status(400)
      .json("you cant remove yourself from friends");
  }
};

export const checkFriendRequest = async (
  req: AppRequest,
  res: Response,
) => {
  const currentUserId = req.user._id;
  try {
    const updatedCurrentUser =
      await UserModel.findByIdAndUpdate(
        currentUserId,
        { notCheckedFriendRequestsFrom: [] },
        { new: true },
      );
    res.status(200).json(updatedCurrentUser);
  } catch (error) {
    res.status(400).json(error);
  }
};

export const checkAcceptedFriendRequest = async (
  req: AppRequest,
  res: Response,
) => {
  const currentUserId = req.user._id;
  try {
    const updatedCurrentUser =
      await UserModel.findByIdAndUpdate(
        currentUserId,
        { notCheckedAcceptedFriendRequestsBy: [] },
        { new: true },
      );
    res.status(200).json(updatedCurrentUser);
  } catch (error) {
    res.status(400).json(error);
  }
};

export const addFriend = async (
  req: AppRequest,
  res: Response,
) => {
  if (
    req.user._id.toString() !== req.params.id.toString()
  ) {
    try {
      const userId = req.params.id;
      let currentUser = await UserModel.findById(
        req.user._id,
      );
      if (
        !currentUser.friends
          .map((f) => f.toString())
          .includes(userId)
      ) {
        currentUser = await UserModel.findByIdAndUpdate(
          currentUser._id,
          {
            $push: {
              friends: userId,
            },
            $pull: {
              friendRequestsFrom: userId,
              notCheckedFriendRequestsFrom: userId,
              friendRequestsTo: userId,
            },
          },
          { new: true },
        );
      }
      let user = await UserModel.findById(userId);

      if (
        !user.friends
          .map((f) => f.toString())
          .includes(currentUser._id.toString())
      ) {
        user = await UserModel.findByIdAndUpdate(
          user._id,
          {
            $push: {
              friends: currentUser._id,
            },
            $pull: {
              friendRequestsTo: currentUser._id,
              notCheckedAcceptedFriendRequestsBy:
                currentUser._id,
              friendRequestsFrom: currentUser._id,
            },
          },
          { new: true },
        );
      }
      res.status(200).json(currentUser);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant friend yourself");
  }
};

export const editProfilePicture = async (
  req: AppRequest,
  res: Response,
) => {
  const { fileName } = req.body;

  try {
    let currentUser = await UserModel.findById(
      req.user._id,
    );

    const oldFileName = currentUser.profilePicture;

    currentUser = await UserModel.findByIdAndUpdate(
      currentUser._id,
      {
        profilePicture: fileName,
      },
      { new: true },
    );

    await fs.remove(
      path.join(
        __dirname,
        `../../public/images/${oldFileName}`,
      ),
    );
    console.log({ oldFileName });

    res.status(200).json(currentUser);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const editCoverPicture = async (
  req: AppRequest,
  res: Response,
) => {
  const { fileName } = req.body;

  try {
    let currentUser = await UserModel.findById(
      req.user._id,
    );

    const oldFileName = currentUser.coverPicture;

    currentUser = await UserModel.findByIdAndUpdate(
      currentUser._id,
      {
        coverPicture: fileName,
      },
      { new: true },
    );

    !!oldFileName &&
      (await fs.remove(
        path.join(
          __dirname,
          `../../public/images/${oldFileName}`,
        ),
      ));
    console.log({ oldFileName });

    res.status(200).json(currentUser);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const editCurrentUserInfos = async (
  req: AppRequest,
  res: Response,
) => {
  const { city, from, relationship } =
    req.body.toUpdateUserInfo;
  try {
    let currentUser = await UserModel.findById(
      req.user._id,
    );

    currentUser = await UserModel.findByIdAndUpdate(
      currentUser._id,
      {
        city,
        from,
        relationship,
      },
      { new: true },
    );

    res.status(200).json(currentUser);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const editCurrentUserDescription = async (
  req: AppRequest,
  res: Response,
) => {
  const { desc } = req.body.toUpdateUserDesc;

  try {
    let currentUser = await UserModel.findById(
      req.user._id,
    );

    currentUser = await UserModel.findByIdAndUpdate(
      currentUser._id,
      {
        desc,
      },
      { new: true },
    );

    res.status(200).json(currentUser);
  } catch (err) {
    res.status(500).json(err);
  }
};
