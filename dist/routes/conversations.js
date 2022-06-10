"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const models_1 = require("../models/");
router.post("/", async (req, res) => {
    const { receiversId } = req.body;
    let { groupName } = req.body;
    try {
        const sender = req.user;
        const receivers = await Promise.all(receiversId.map((r) => models_1.UserModel.findById(r)));
        if (receivers.includes(null)) {
            res
                .status(400)
                .json("you are trying an unauthorized operation !");
        }
        else {
            if (!groupName) {
                if ((receiversId === null || receiversId === void 0 ? void 0 : receiversId.length) > 1) {
                    groupName = `${receivers[0]}, ${receivers[1]} and ${receivers.length - 2} others ...`;
                }
            }
            const newConversation = new models_1.ConversationModel({
                ...req.body,
                membersId: [sender._id, ...receiversId],
                adminsId: [sender._id],
                groupName,
            });
            const savedConversation = await newConversation.save();
            res.status(200).json(savedConversation);
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});
router.put("/:id", async (req, res) => {
    var _a;
    try {
        const conversation = await models_1.ConversationModel.findById(req.params.id);
        if (((_a = conversation.membersId) === null || _a === void 0 ? void 0 : _a.map((m) => m.toString()).includes(req.user._id.toString())) &&
            req.user._id.toString() === req.user._id.toString()) {
            const updatedConversation = await conversation.updateOne({
                $set: { ...req.body.conversation },
            });
            res.status(200).json(updatedConversation);
        }
        else {
            res
                .status(403)
                .json("you are not member of this conversation");
        }
    }
    catch (err) {
        res.status(500).json(err);
    }
});
router.delete("/:id", async (req, res) => {
    var _a;
    try {
        const conversation = await models_1.ConversationModel.findById(req.params.id);
        if ((_a = conversation.adminsId) === null || _a === void 0 ? void 0 : _a.map((a) => a.toString()).includes(req.user._id.toString())) {
            await conversation.deleteOne();
            res
                .status(200)
                .json("the conversation has been deleted");
        }
        else {
            res
                .status(403)
                .json("you can delete only your conversations");
        }
    }
    catch (err) {
        res.status(500).json(err);
    }
});
router.get("/private/:userId", async (req, res) => {
    const userId = req.params.userId;
    const currentUser = req.user;
    try {
        const conversation = await models_1.ConversationModel.findOne({
            $or: [
                { membersId: [userId, currentUser._id] },
                { membersId: [currentUser._id, userId] },
            ],
        });
        res.status(200).json(conversation);
    }
    catch (e) {
        console.log(e);
        res.status(400).json("oups");
    }
});
router.get("/one/:id", async (req, res) => {
    try {
        const post = await models_1.ConversationModel.findById(req.params.id);
        res.status(200).json(post);
    }
    catch (err) {
        res.status(500).json(err);
    }
});
router.get("/last", async (req, res) => {
    const currentUser = req.user;
    try {
        const lastConversation = await models_1.ConversationModel.find({
            membersId: { $all: [currentUser._id] },
        })
            .sort({ updatedAt: -1 })
            .limit(1);
        res.status(200).json(lastConversation);
    }
    catch (e) {
        res.status(500).json(e);
    }
});
router.get("/", async (req, res) => {
    try {
        const conversations = await models_1.ConversationModel.find({
            membersId: { $in: req.user._id },
        }).sort({ updatedAt: -1 });
        const populatedConversations = await Promise.all(conversations.map(async (c) => {
            if (!c.lastMessageId) {
                const lastMessages = await models_1.MessageModel.find({
                    conversationId: c._id,
                }).sort({ updatedAt: -1, limit: 1 });
                const lastMessage = lastMessages[0];
                if (!!lastMessage) {
                    const conversation = await models_1.ConversationModel.findByIdAndUpdate(c._id, { lastMessageId: lastMessage._id });
                    return conversation.populate("lastMessageId");
                }
                else {
                    await models_1.ConversationModel.findByIdAndDelete(c._id);
                    return c;
                }
            }
            else
                return c.populate("lastMessageId");
        }));
        res.status(200).json(populatedConversations);
    }
    catch (err) {
        res.status(500).json(err);
    }
});
router.put("/addMembers/:conversationId", async (req, res) => {
    const { newMembersId, inviterId } = req.body;
    const { conversationId } = req.params;
    try {
        const conversation = await models_1.ConversationModel.findById(conversationId);
        const inviter = await models_1.UserModel.findById(inviterId);
        const newMembers = await Promise.all(newMembersId.map((n) => models_1.UserModel.findById(n)));
        if (!conversation ||
            !inviter ||
            newMembers.includes(null)) {
            res.status(400).json(`You are trying to deal with unexisting datas:
            ${!conversation && "conversation"}
            ${!inviter && "inviter"}
            ${newMembers.includes(null) &&
                "one newMember doesn't exist"}
            `);
        }
        else if (!conversation.adminsId
            .map((a) => a.toString())
            .includes(inviterId)) {
            res
                .status(400)
                .json("You are not allowed to invite people in this conversation, you should ask an admin to do it");
        }
        else {
            for (const n of newMembersId) {
                if (conversation.membersId.includes(n)) {
                    res
                        .status(400)
                        .json("You are trying to invite members already inside room");
                    return;
                }
            }
            const c = await models_1.ConversationModel.findByIdAndUpdate(conversationId, {
                $set: {
                    membersId: [
                        ...conversation.membersId,
                        ...newMembersId,
                    ],
                },
            }, { runValidators: true, new: true });
            res.status(200).json(c);
        }
    }
    catch (error) {
        res.status(500).json(error);
    }
});
router.put("/removeMembers/:conversationId", async (req, res) => {
    let e = 0;
    const { leavingMembersId } = req.body;
    const { conversationId } = req.params;
    try {
        const conversation = await models_1.ConversationModel.findById(conversationId);
        const currentUser = await models_1.UserModel.findById(req.user._id);
        if (!currentUser.isAdmin ||
            !conversation.adminsId
                .map((a) => a.toString())
                .includes(currentUser._id.toString())) {
            if (leavingMembersId.length > 1 ||
                leavingMembersId[0] !== currentUser._id.toString()) {
                e++;
                res
                    .status(400)
                    .json("Only an admin is allowed to do this opération");
            }
        }
        if (currentUser.isAdmin ||
            leavingMembersId.length === 1 ||
            conversation.adminsId
                .map((a) => a.toString())
                .includes(currentUser._id.toString())) {
            const leavingMembers = await Promise.all(leavingMembersId.map((l) => models_1.UserModel.findById(l)));
            if (!conversation ||
                !currentUser ||
                leavingMembers.includes(null)) {
                e++;
                res
                    .status(400)
                    .json("You are trying to deal with unexisting datas !");
            }
            else {
                for (const l of leavingMembersId) {
                    if (!conversation.membersId.includes(l)) {
                        e++;
                        res
                            .status(400)
                            .json("You are trying to fire members not inside conversation");
                        break;
                    }
                }
            }
            if (e === 0) {
                const updatedMembersId = conversation.membersId.filter((m) => !leavingMembersId.includes(m.toString()));
                const c = await models_1.ConversationModel.findByIdAndUpdate(conversationId, {
                    $set: {
                        membersId: updatedMembersId,
                    },
                }, { runValidators: true, new: true });
                res.status(200).json(c);
            }
        }
    }
    catch (error) {
        res.status(500).json(error);
    }
});
exports.default = router;
//# sourceMappingURL=conversations.js.map