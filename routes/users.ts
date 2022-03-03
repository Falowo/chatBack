import express, { Response } from "express";
import { AppRequest } from "../config/jwt.config";
const router = express.Router();
import { ConversationModel, UserModel } from "../models/";
import { User } from "../models/User";
const bcrypt = require("bcrypt");

//update user
router.put(
  "/:id",
  async (req: AppRequest, res: Response) => {
    if (
      req.body.userId === req.params.id ||
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
  },
);

//delete user
router.delete(
  "/:id",
  async (req: AppRequest, res: Response) => {
    if (
      req.body.userId === req.params.id ||
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
  },
);

//get a user by query
router.get("/", async (req: AppRequest, res: Response) => {
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
});

// get all users matching search

router.get(
  "/search/:search",
  async (req: AppRequest, res: Response) => {
    const search = req.params.search;
    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[]\]/g, "$&");
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
          (l) =>
            l._id.toString() !== req.user._id.toString(),
        );

      res.status(200).json(lightUsers);
    } catch (err) {
      res.status(500).json(err);
    }
  },
);

//get friends
router.get(
  "/best/currentUser/friends",
  async (req: AppRequest, res: Response) => {
    try {
      // const currentUser: User = await UserModel.findById(
      //   req.user._id,
      // );

      // let friends: User[] = [];

      const conversations = await ConversationModel.find(
        {
          membersId: { $in: req.user._id },
        },
        "membersId",
      ).sort({ updatedAt: -1 });

      const filteredConversations = conversations.filter(
        (c) => c.membersId?.length < 3,
      );

      const users: string[] = filteredConversations
        .map((f) => [...f.membersId])
        .flat()
        .map((objId) => objId.toString());

      const reducedUsers = Array.from(new Set(users));

      res.status(200).json(reducedUsers);
    } catch (err) {
      res.status(500).json(err);
    }
  },
);

//get friends
router.get(
  "/friends/:userId",
  async (req: AppRequest, res: Response) => {
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
  },
);

//get followedUsers
router.get(
  "/followedUsers/:id",
  async (req: AppRequest, res: Response) => {
    try {
      const user: User = await UserModel.findById(
        req.params.id,
      );

      const followedIds = user.followedIds;

      const friends = await Promise.all(
        followedIds?.map((friendId) =>
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
  },
);
//get followers
router.get(
  "/followers/:userId",
  async (req: AppRequest, res: Response) => {
    try {
      const user: User = await UserModel.findById(
        req.params.userId,
      );

      const followersIds = user.followersIds;

      const friends = await Promise.all(
        followersIds?.map((friendId) =>
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
  },
);

//follow a user

router.put(
  "/:id/follow",
  async (req: AppRequest, res: Response) => {
    if (
      req.user._id.toString() !== req.params.id.toString()
    ) {
      try {
        const user = await UserModel.findById(
          req.params.id,
        );
        const currentUser = await UserModel.findById(
          req.user._id,
        );
        if (
          !user.followersIds
            .map((f) => f.toString())
            .includes(req.user._id.toString())
        ) {
          if (
            currentUser.followersIds
              .map((f) => f.toString())
              .includes(user._id.toString()) &&
            !currentUser.friends
              .map((f) => f.toString())
              .includes(user._id.toString())
          ) {
            await user.updateOne({
              $push: {
                followersIds: req.user._id,
                friends: req.user._id,
              },
            });
            await currentUser.updateOne({
              $push: {
                followedIds: req.params.id,
                friends: req.params.id,
              },
            });
          } else {
            await user.updateOne({
              $push: { followersIds: req.user._id },
            });
            await currentUser.updateOne({
              $push: { followedIds: req.params.id },
            });
          }

          res.status(200).json("user has been followed");
        } else {
          res
            .status(403)
            .json("you allready follow this user");
        }
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json("you cant follow yourself");
    }
  },
);

//unfollow a user

router.put(
  "/:id/unfollow",
  async (req: AppRequest, res: Response) => {
    if (
      req.user._id.toString() !== req.params.id.toString()
    ) {
      try {
        const user = await UserModel.findById(
          req.params.id,
        );
        const currentUser = await UserModel.findById(
          req.user._id,
        );
        if (
          user.followersIds
            .map((f) => f.toString())
            .includes(req.user._id.toString())
        ) {
          await user.updateOne({
            $pull: { followersIds: req.user._id },
          });
          await currentUser.updateOne({
            $pull: { followedIds: req.params.id },
          });
          res.status(200).json("user has been unfollowed");
        } else {
          res.status(403).json("you dont follow this user");
        }
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json("you cant unfollow yourself");
    }
  },
);

// sendFriend REquest

router.put(
  "/:id/friendRequest",
  async (req: AppRequest, res: Response) => {
    if (
      req.user._id.toString() !== req.params.id.toString()
    ) {
      try {
        const user = await UserModel.findById(
          req.params.id,
        );
        const currentUser = req.user;
        let updatedUser: User;
        let updatedCurrentUser: User;
        if (
          !currentUser.friendRequestsTo
            .map((f) => f.toString())
            .includes(user?._id!.toString()) ||
          (currentUser.friendRequestsFrom
            .map((f) => f.toString())
            .includes(user._id.toString()) &&
            !currentUser.friends
              .map((f) => f.toString())
              .includes(user._id.toString()))
        ) {
          if (
            currentUser.friendRequestsFrom
              .map((f) => f.toString())
              .includes(user._id.toString()) &&
            !currentUser.friends
              .map((f) => f.toString())
              .includes(user._id.toString())
          ) {
            updatedUser = await UserModel.findOneAndUpdate(
              { _id: user._id },
              {
                $push: { friends: currentUser._id },
                $pull: {
                  friendRequestsTo: currentUser._id,
                },
              },

              { new: true },
            );

            updatedCurrentUser =
              await UserModel.findOneAndUpdate(
                { _id: currentUser._id },
                {
                  $push: { friends: req.params.id },
                  $pull: {
                    friendRequestsFrom: req.params.id,
                  },
                },
                { new: true },
              );
          } else {
            updatedUser = await UserModel.findOneAndUpdate(
              { _id: user._id },
              {
                $push: { friendRequestsFrom: req.user._id },
                $inc: {notCheckedFriendRequestsNumber: +1}
              },
              { new: true },
            );
            updatedCurrentUser =
              await UserModel.findOneAndUpdate(
                { _id: currentUser._id },
                {
                  $push: {
                    friendRequestsTo: req.params.id,
                  },
                },
                { new: true },
              );
          }

          !!updatedUser &&
            !!updatedCurrentUser &&
            res
              .status(200)
              .json({ updatedUser, updatedCurrentUser });
        } else {
          res
            .status(403)
            .json(
              `you already sent friend request to ${user.username}`,
            );
        }
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res
        .status(403)
        .json(`you can't send friend request to yourself`);
    }
  },
);

// addFriend


router.put(
  "/:id/addFriend",
  async (req: AppRequest, res: Response) => {
    if (
      req.user._id.toString() !== req.params.id.toString()
    ) {
      try {
        const userId = 
          req.params.id
        ;
        const currentUser = await UserModel.findById(
          req.user._id,
        );
        if (
          !currentUser.friends
            .map((f) => f.toString())
            .includes(userId)
        ) {
          
            await currentUser.updateOne(
              {
                $push: {
                  friends: userId,
                },
              },
              { new: true },
            );

          res.status(200).json("one User has been added as friend");
        } else {
          res
            .status(403)
            .json("you allready friend this user");
        }
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json("you cant friend yourself");
    }
  },
);

export default router;
