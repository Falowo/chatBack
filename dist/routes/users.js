"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const models_1 = require("../models/");
const bcrypt_1 = __importDefault(require("bcrypt"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
router.put("/:id", async (req, res) => {
    if (req.body.userId === req.params.id ||
        req.body.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt_1.default.genSalt(10);
                req.body.password = await bcrypt_1.default.hash(req.body.password, salt);
            }
            catch (err) {
                res.status(500).json(err);
            }
        }
        try {
            await models_1.UserModel.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            });
            res.status(200).json("Account has been updated");
        }
        catch (err) {
            res.status(500).json(err);
        }
    }
    else {
        res
            .status(403)
            .json("You can update only your account!");
    }
});
router.delete("/:id", async (req, res) => {
    if (req.body.userId === req.params.id ||
        req.body.isAdmin) {
        try {
            await models_1.UserModel.findByIdAndDelete(req.params.id);
            res.status(200).json("Account has been deleted");
        }
        catch (err) {
            res.status(500).json(err);
        }
    }
    else {
        res
            .status(403)
            .json("You can delete only your account!");
    }
});
router.get("/", async (req, res) => {
    const userId = req.query.userId;
    const username = req.query.username;
    try {
        const user = userId
            ? await models_1.UserModel.findById(userId)
            : await models_1.UserModel.findOne({ username: username });
        const { password, updatedAt, ...other } = user;
        res.status(200).json(other);
    }
    catch (err) {
        res.status(500).json(err);
    }
});
router.get("/search/:search", async (req, res) => {
    const search = req.params.search;
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[]\]/g, "$&");
    }
    const escapedSearch = escapeRegExp(search);
    const regExp = `^${escapedSearch}`;
    const reg = new RegExp(regExp, "ig");
    try {
        const users = await models_1.UserModel.find({
            username: { $regex: reg },
        });
        const lightUsers = users
            .map((u) => {
            const { _id, username, profilePicture } = u;
            return { _id, username, profilePicture };
        })
            .filter((l) => l._id.toString() !== req.user._id.toString());
        res.status(200).json(lightUsers);
    }
    catch (err) {
        res.status(500).json(err);
    }
});
router.get("/best/currentUser/friends", async (req, res) => {
    try {
        const conversations = await models_1.ConversationModel.find({
            $and: [
                { membersId: { $in: [req.user._id] } },
                { membersId: { $size: 2 } },
            ],
        }, "membersId _id").sort({ updatedAt: -1 });
        const conversationAndUser = conversations.flatMap((c) => ({
            memberId: c.membersId
                .map((mId) => mId.toString())
                .filter((mId) => mId !== req.user._id.toString())[0],
            conversationId: c._id,
        }));
        const friendsAndMessagesNumber = await Promise.all(conversationAndUser.map(async (c) => {
            const numberOfMessages = await models_1.MessageModel.find({
                conversationId: c.conversationId,
            }).count();
            return { friendId: c.memberId, numberOfMessages };
        }));
        friendsAndMessagesNumber.sort((a, b) => {
            return b.numberOfMessages - a.numberOfMessages;
        });
        res.status(200).json(friendsAndMessagesNumber);
    }
    catch (err) {
        res.status(500).json(err);
    }
});
router.get("/friends/:userId", async (req, res) => {
    var _a;
    try {
        const user = await models_1.UserModel.findById(req.params.userId);
        const friends = await Promise.all((_a = user.friends) === null || _a === void 0 ? void 0 : _a.map((friendId) => models_1.UserModel.findById(friendId, "_id username profilePicture")));
        res.status(200).json(friends);
    }
    catch (err) {
        res.status(500).json(err);
    }
});
router.get("/followedUsers/:id", async (req, res) => {
    try {
        const user = await models_1.UserModel.findById(req.params.id);
        const followedIds = user.followedIds;
        const friends = await Promise.all(followedIds === null || followedIds === void 0 ? void 0 : followedIds.map((friendId) => models_1.UserModel.findById(friendId, "_id username profilePicture")));
        res.status(200).json(friends);
    }
    catch (err) {
        res.status(500).json(err);
    }
});
router.get("/followers/:userId", async (req, res) => {
    try {
        const user = await models_1.UserModel.findById(req.params.userId);
        const followersIds = user.followersIds;
        const friends = await Promise.all(followersIds === null || followersIds === void 0 ? void 0 : followersIds.map((friendId) => models_1.UserModel.findById(friendId, "_id username profilePicture")));
        res.status(200).json(friends);
    }
    catch (err) {
        res.status(500).json(err);
    }
});
router.put("/:id/follow", async (req, res) => {
    if (req.user._id.toString() !== req.params.id.toString()) {
        try {
            let user = await models_1.UserModel.findById(req.params.id);
            let currentUser = await models_1.UserModel.findById(req.user._id);
            if (!user.followersIds
                .map((f) => f.toString())
                .includes(req.user._id.toString())) {
                if (currentUser.followersIds
                    .map((f) => f.toString())
                    .includes(user._id.toString()) &&
                    !currentUser.friends
                        .map((f) => f.toString())
                        .includes(user._id.toString())) {
                    user = await models_1.UserModel.findByIdAndUpdate(user._id, {
                        $push: {
                            followersIds: req.user._id,
                            friends: req.user._id,
                        },
                        $pull: {
                            friendRequestsFrom: req.user._id,
                            friendRequestsTo: req.user._id,
                            notCheckedFriendRequestsFrom: req.user._id,
                        },
                    }, { new: true });
                    currentUser = await models_1.UserModel.findByIdAndUpdate(currentUser._id, {
                        $push: {
                            followedIds: req.params.id,
                            friends: req.params.id,
                        },
                        $pull: {
                            friendRequestsFrom: req.params.id,
                            friendRequestsTo: req.params.id,
                            notCheckedFriendRequestsFrom: req.params.id,
                        },
                    }, { new: true });
                }
                else {
                    user = await models_1.UserModel.findByIdAndUpdate(user._id, {
                        $push: { followersIds: req.user._id },
                    });
                    currentUser = await models_1.UserModel.findByIdAndUpdate(currentUser.id, {
                        $push: { followedIds: req.params.id },
                    });
                }
                res.status(200).json({ user, currentUser });
            }
            else {
                res
                    .status(403)
                    .json("you allready follow this user");
            }
        }
        catch (err) {
            res.status(500).json(err);
        }
    }
    else {
        res.status(403).json("you cant follow yourself");
    }
});
router.put("/:id/unfollow", async (req, res) => {
    if (req.user._id.toString() !== req.params.id.toString()) {
        try {
            let user = await models_1.UserModel.findById(req.params.id);
            let currentUser = await models_1.UserModel.findById(req.user._id);
            if (user.followersIds
                .map((f) => f.toString())
                .includes(req.user._id.toString())) {
                user = await models_1.UserModel.findByIdAndUpdate(user._id, {
                    $pull: { followersIds: req.user._id },
                }, { new: true });
                currentUser = await models_1.UserModel.findByIdAndUpdate(currentUser._id, {
                    $pull: { followedIds: req.params.id },
                }, { new: true });
                res.status(200).json({ user, currentUser });
            }
            else {
                res.status(403).json("you dont follow this user");
            }
        }
        catch (err) {
            res.status(500).json(err);
        }
    }
    else {
        res.status(403).json("you cant unfollow yourself");
    }
});
router.get("/friend/requests/from", async (req, res) => {
    var _a;
    const currentUserId = req.user._id;
    const currentUser = await models_1.UserModel.findById(currentUserId);
    try {
        const users = await Promise.all((_a = currentUser.friendRequestsFrom) === null || _a === void 0 ? void 0 : _a.map(async (fId) => {
            const f = await models_1.UserModel.findById(fId);
            const { _id, username, profilePicture } = f;
            return {
                _id,
                username,
                profilePicture,
            };
        }));
        console.log({ friendRequestFrom: users });
        res.status(200).json(users);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
router.put("/:id/friendRequest", async (req, res) => {
    if (req.user._id.toString() !== req.params.id.toString()) {
        try {
            let user = await models_1.UserModel.findById(req.params.id);
            let currentUser = await models_1.UserModel.findById(req.user._id);
            if (!currentUser.friendRequestsTo
                .map((f) => f.toString())
                .includes(user === null || user === void 0 ? void 0 : user._id.toString()) &&
                !currentUser.friends
                    .map((f) => f.toString())
                    .includes(user === null || user === void 0 ? void 0 : user._id.toString())) {
                console.log("the_user_has_not_already_been_requested_as_friend_&&_user_is_not__already_friend");
                if (currentUser.friendRequestsFrom
                    .map((f) => f.toString())
                    .includes(user._id.toString())) {
                    console.log("the_user_had send__friendRequest__to___currentUser___before");
                    user = await models_1.UserModel.findOneAndUpdate({ _id: user._id }, {
                        $push: {
                            friends: currentUser._id,
                            notCheckedAcceptedFriendRequestsBy: currentUser._id,
                        },
                        $pull: {
                            friendRequestsTo: currentUser._id,
                        },
                    }, { new: true });
                    currentUser = await models_1.UserModel.findOneAndUpdate({ _id: currentUser._id }, {
                        $push: { friends: req.params.id },
                        $pull: {
                            friendRequestsFrom: req.params.id,
                            notCheckedFriendRequestsFrom: req.params.id,
                        },
                    }, { new: true });
                    console.log({ currentUser });
                }
                else {
                    user = await models_1.UserModel.findOneAndUpdate({ _id: user._id }, {
                        $push: {
                            friendRequestsFrom: req.user._id,
                            notCheckedFriendRequestsFrom: req.user._id,
                        },
                    }, { new: true });
                    currentUser = await models_1.UserModel.findOneAndUpdate({ _id: currentUser._id }, {
                        $push: {
                            friendRequestsTo: req.params.id,
                        },
                    }, { new: true });
                }
                res.status(200).json({ user, currentUser });
            }
            else {
                res
                    .status(403)
                    .json(`you already sent friend request to ${user.username}`);
            }
        }
        catch (err) {
            res.status(500).json(err);
        }
    }
    else {
        res
            .status(403)
            .json(`you can't send friend request to yourself`);
    }
});
router.put("/currentUser/checkFriendRequests", async (req, res) => {
    const currentUserId = req.user._id;
    try {
        const updatedCurrentUser = await models_1.UserModel.findByIdAndUpdate(currentUserId, { notCheckedFriendRequestsFrom: [] }, { new: true });
        res.status(200).json(updatedCurrentUser);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
router.put("/currentUser/checkAcceptedFriendRequests", async (req, res) => {
    const currentUserId = req.user._id;
    try {
        const updatedCurrentUser = await models_1.UserModel.findByIdAndUpdate(currentUserId, { notCheckedAcceptedFriendRequestsBy: [] }, { new: true });
        res.status(200).json(updatedCurrentUser);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
router.put("/:id/addFriend", async (req, res) => {
    if (req.user._id.toString() !== req.params.id.toString()) {
        try {
            const userId = req.params.id;
            let currentUser = await models_1.UserModel.findById(req.user._id);
            if (!currentUser.friends
                .map((f) => f.toString())
                .includes(userId)) {
                currentUser = await models_1.UserModel.findByIdAndUpdate(currentUser._id, {
                    $push: {
                        friends: userId,
                    },
                    $pull: {
                        friendRequestsFrom: userId,
                        notCheckedFriendRequestsFrom: userId,
                        friendRequestsTo: userId,
                    },
                }, { new: true });
                res.status(200).json(currentUser);
            }
            else {
                res
                    .status(403)
                    .json("you allready friend this user");
            }
        }
        catch (err) {
            res.status(500).json(err);
        }
    }
    else {
        res.status(403).json("you cant friend yourself");
    }
});
router.put("/currentUser/editProfilePicture", async (req, res) => {
    const { fileName } = req.body;
    try {
        let currentUser = await models_1.UserModel.findById(req.user._id);
        const oldFileName = currentUser.profilePicture;
        currentUser = await models_1.UserModel.findByIdAndUpdate(currentUser._id, {
            profilePicture: fileName,
        }, { new: true });
        await fs_extra_1.default.remove(path_1.default.join(__dirname, `../public/images/${oldFileName}`));
        console.log({ oldFileName });
        res.status(200).json(currentUser);
    }
    catch (err) {
        res.status(500).json(err);
    }
});
router.put("/currentUser/editCoverPicture", async (req, res) => {
    const { fileName } = req.body;
    try {
        let currentUser = await models_1.UserModel.findById(req.user._id);
        const oldFileName = currentUser.coverPicture;
        currentUser = await models_1.UserModel.findByIdAndUpdate(currentUser._id, {
            coverPicture: fileName,
        }, { new: true });
        !!oldFileName &&
            (await fs_extra_1.default.remove(path_1.default.join(__dirname, `../public/images/${oldFileName}`)));
        console.log({ oldFileName });
        res.status(200).json(currentUser);
    }
    catch (err) {
        res.status(500).json(err);
    }
});
router.put("/currentUser/updateInfo", async (req, res) => {
    const { city, from, relationship } = req.body.toUpdateUserInfo;
    try {
        let currentUser = await models_1.UserModel.findById(req.user._id);
        currentUser = await models_1.UserModel.findByIdAndUpdate(currentUser._id, {
            city,
            from,
            relationship,
        }, { new: true });
        res.status(200).json(currentUser);
    }
    catch (err) {
        res.status(500).json(err);
    }
});
router.put("/currentUser/updateDesc", async (req, res) => {
    const { desc } = req.body.toUpdateUserDesc;
    try {
        let currentUser = await models_1.UserModel.findById(req.user._id);
        currentUser = await models_1.UserModel.findByIdAndUpdate(currentUser._id, {
            desc,
        }, { new: true });
        res.status(200).json(currentUser);
    }
    catch (err) {
        res.status(500).json(err);
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map