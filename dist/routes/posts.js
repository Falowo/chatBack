"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const models_1 = require("../models/");
router.post("/", async (req, res) => {
    const newPost = new models_1.PostModel(req.body);
    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    }
    catch (err) {
        res.status(500).json(err);
    }
});
router.put("/:id", async (req, res) => {
    try {
        const post = await models_1.PostModel.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.updateOne({ $set: req.body });
            res.status(200).json("the post has been updated");
        }
        else {
            res
                .status(403)
                .json("you can update only your post");
        }
    }
    catch (err) {
        res.status(500).json(err);
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const post = await models_1.PostModel.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.deleteOne();
            res.status(200).json("the post has been deleted");
        }
        else {
            res
                .status(403)
                .json("you can delete only your post");
        }
    }
    catch (err) {
        res.status(500).json(err);
    }
});
router.put("/:id/like", async (req, res) => {
    var _a;
    const currentUserId = req.user._id;
    const postId = req.params.id;
    try {
        const post = await models_1.PostModel.findById(postId);
        if (!((_a = post.likersId) === null || _a === void 0 ? void 0 : _a.map((l) => l.toString()).includes(currentUserId.toString()))) {
            await post.updateOne({
                $push: { likersId: currentUserId },
            });
            res.status(200).json("The post has been liked");
        }
        else {
            await post.updateOne({
                $pull: { likersId: currentUserId },
            });
            res.status(200).json("The post has been disliked");
        }
    }
    catch (err) {
        res.status(500).json(err);
    }
});
router.get("/timeline/currentUser", async (req, res) => {
    var _a;
    try {
        const currentUser = await models_1.UserModel.findById(req.user._id);
        const currentUserPosts = await models_1.PostModel.find({
            userId: req.user._id,
        })
            .sort({ createdAt: -1 })
            .limit(3);
        let friendsPosts = [];
        await Promise.all((_a = currentUser === null || currentUser === void 0 ? void 0 : currentUser.followedIds) === null || _a === void 0 ? void 0 : _a.map(async (f) => {
            const posts = await models_1.PostModel.find({ userId: f })
                .sort({ createdAt: -1 })
                .limit(10);
            friendsPosts.push(posts);
        }));
        const flatFriendsPosts = friendsPosts
            .flat()
            .filter((p) => !p.onTheWallOf ||
            p.onTheWallOf.toString() ===
                currentUser._id.toString());
        const timeline = (currentUserPosts || []).concat(flatFriendsPosts);
        timeline.sort((a, b) => {
            return (b.createdAt.valueOf() - a.createdAt.valueOf());
        });
        res.status(200).json(timeline);
    }
    catch (err) {
        res.status(500).json(err);
    }
});
router.get("/profile/:username", async (req, res) => {
    const username = req.params.username;
    try {
        const user = await models_1.UserModel.findOne({
            username: username,
        });
        const posts = await models_1.PostModel.find({
            $or: [
                { userId: user._id },
                { onTheWallOf: user._id },
            ],
        }).sort({ createdAt: -1 });
        const filteredPosts = posts.filter((p) => !p.onTheWallOf ||
            p.onTheWallOf.toString() === user._id.toString());
        res.status(200).json(filteredPosts);
    }
    catch (err) {
        res.status(500).json(err);
    }
});
router.get("/:id", async (req, res) => {
    try {
        const post = await models_1.PostModel.findById(req.params.id);
        res.status(200).json(post);
    }
    catch (err) {
        res.status(500).json(err);
    }
});
exports.default = router;
//# sourceMappingURL=posts.js.map