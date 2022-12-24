import express, { Response } from "express";
import { AppRequest } from "../config/jwt.config";
const router = express.Router();
import { PostModel, UserModel } from "../database/models";
import { Post } from "../database/models/Post";
import * as fs from "fs";
import path from "path";

//create a post

router.post("/", async (req: AppRequest, res: Response) => {
  const newPost = new PostModel(req.body);

  try {
    if (
      newPost.userId.toString() === req.user._id.toString()
    ) {
      const savedPost = await newPost.save();
      res.status(200).json(savedPost);
    } else {
      res.status(403).json("Are you trying to cheat?");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//update a post

router.put(
  "/update",
  async (req: AppRequest, res: Response) => {
    try {
      const { updatedPost } = req.body;
      console.log(updatedPost);
      if (
        updatedPost.userId.toString() ===
        req.user._id.toString()
      ) {
        // deletion of old files

        const post = await PostModel.findById(
          updatedPost._id,
        );
        if (!!post.img && post.img !== updatedPost.img) {
          fs.rm(
            path.join(
              __dirname,
              "../../public/images",
              post.img,
            ),
            () => {
              console.log("");
            },
          );
        }

        if (
          !!post.video &&
          post.video !== updatedPost.video
        ) {
          fs.rm(
            path.join(
              __dirname,
              "../../public/video",
              post.video,
            ),
            () => {
              console.log("");
            },
          );
        }
        if (
          !!post.audio &&
          post.audio !== updatedPost.audio
        ) {
          fs.rm(
            path.join(
              __dirname,
              "../../public/audio",
              post.audio,
            ),
            () => {
              console.log("");
            },
          );
        }

        // deletion end

        const returnedUpdatedPost =
          await PostModel.findOneAndUpdate(
            { _id: updatedPost._id },
            {
              $set: {
                desc: updatedPost.desc,
                img: updatedPost.img,
                video: updatedPost.video,
                audio: updatedPost.audio,
              },
            },
          );

        console.log({ returnedUpdatedPost });

        res.status(200).json("the post has been updated");
      } else {
        res
          .status(403)
          .json("you can update only your post");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  },
);
//delete a post

router.delete(
  "/:id",
  async (req: AppRequest, res: Response) => {
    try {
      const post = await PostModel.findById(req.params.id);
      if (post.userId === req.body.userId) {
        if (!!post.img) {
          fs.rm(
            path.join(
              __dirname,
              "../../public/images",
              post.img,
            ),
            () => {
              console.log("");
            },
          );
        }

        if (!!post.video) {
          fs.rm(
            path.join(
              __dirname,
              "../../public/video",
              post.video,
            ),
            () => {
              console.log("");
            },
          );
        }
        if (!!post.audio) {
          fs.rm(
            path.join(
              __dirname,
              "../../public/audio",
              post.audio,
            ),
            () => {
              console.log("");
            },
          );
        }
        await post.deleteOne();
        res.status(200).json("the post has been deleted");
      } else {
        res
          .status(403)
          .json("you can delete only your post");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  },
);
//like / dislike a post

router.put(
  "/:id/like",
  async (req: AppRequest, res: Response) => {
    const currentUserId = req.user._id;
    const postId = req.params.id;
    try {
      const post = await PostModel.findById(postId);
      if (
        !post.likersId
          ?.map((l) => l.toString())
          .includes(currentUserId.toString())
      ) {
        await post.updateOne({
          $push: { likersId: currentUserId },
        });
        res.status(200).json("The post has been liked");
      } else {
        await post.updateOne({
          $pull: { likersId: currentUserId },
        });
        res.status(200).json("The post has been disliked");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  },
);

//get timeline posts

router.get(
  "/timeline/currentUser",
  async (req: AppRequest, res: Response) => {
    try {
      const currentUser = await UserModel.findById(
        req.user._id,
      );
      const currentUserPosts: Post[] = await PostModel.find(
        {
          userId: req.user._id,
        },
      )
        .sort({ createdAt: -1 })
        .limit(3);

      let friendsPosts: Post[][] = [];

      await Promise.all(
        currentUser?.followedIds?.map(async (f) => {
          const posts = await PostModel.find({ userId: f })
            .sort({ createdAt: -1 })
            .limit(10);

          friendsPosts.push(posts);
        }),
      );

      const flatFriendsPosts: Post[] = friendsPosts
        .flat()
        .filter(
          (p) =>
            !p.onTheWallOf ||
            p.onTheWallOf.toString() ===
              currentUser._id.toString(),
        );

      const timeline = (currentUserPosts || []).concat(
        flatFriendsPosts,
      );

      timeline.sort((a: Post, b: Post) => {
        return (
          b.createdAt!.valueOf() - a.createdAt!.valueOf()
        );
      });

      res.status(200).json(timeline);
    } catch (err) {
      res.status(500).json(err);
    }
  },
);

//get user's all posts

router.get(
  "/profile/:username",
  async (req: AppRequest, res: Response) => {
    const username = req.params.username;
    try {
      const user = await UserModel.findOne({
        username: username,
      });
      const posts = await PostModel.find({
        $or: [
          { userId: user._id },
          { onTheWallOf: user._id },
        ],
      }).sort({ createdAt: -1 });

      const filteredPosts = posts.filter(
        (p) =>
          !p.onTheWallOf ||
          p.onTheWallOf.toString() === user._id.toString(),
      );

      res.status(200).json(filteredPosts);
    } catch (err) {
      res.status(500).json(err);
    }
  },
);

//get a post

router.get(
  "/:id",
  async (req: AppRequest, res: Response) => {
    try {
      const post = await PostModel.findById(req.params.id);
      res.status(200).json(post);
    } catch (err) {
      res.status(500).json(err);
    }
  },
);

export default router;
