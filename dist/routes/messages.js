"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const models_1 = require("../models/");
router.post("/", async (req, res) => {
    var _a;
    const { senderId, conversationId } = req.body;
    try {
        const conversation = await models_1.ConversationModel.findById(conversationId);
        if (!!conversation &&
            senderId.toString() === req.user._id.toString() &&
            ((_a = conversation.membersId) === null || _a === void 0 ? void 0 : _a.map((m) => m.toString()).includes(req.user._id.toString()))) {
            const newMessage = new models_1.MessageModel({
                ...req.body,
                status: 20,
            });
            const savedMessage = await newMessage.save();
            const populatedMessage = await savedMessage.populate("senderId");
            await conversation.update({
                lastMessageId: savedMessage._id,
            });
            res.status(200).json(populatedMessage);
        }
        else {
            res.status(400).json("Unauthorized opération");
        }
    }
    catch (error) {
        res.status(500).json(error);
    }
});
router.put("/receivedBy/currentUser", async (req, res) => {
    var _a;
    const { messageId } = req.body;
    const userId = req.user._id;
    try {
        const message = await models_1.MessageModel.findById(messageId);
        const conversation = await models_1.ConversationModel.findById(message.conversationId);
        let status;
        if (!!conversation &&
            ((_a = conversation.membersId) === null || _a === void 0 ? void 0 : _a.map((m) => m.toString()).includes(userId.toString())) &&
            !message.receivedByIds
                .map((r) => r.toString())
                .includes(userId.toString())) {
            const receivedByIds = [
                ...message.receivedByIds,
                userId,
            ];
            if (areEqual(conversation === null || conversation === void 0 ? void 0 : conversation.membersId.map((mId) => mId.toString()).filter((mId) => mId !== message.senderId.toString()), receivedByIds.map((m) => m.toString())) &&
                message.status !== 40) {
                status = 30;
            }
            else {
                status = message.status ? message.status : 20;
            }
            const updatedMessage = await models_1.MessageModel.findByIdAndUpdate(message._id, {
                status,
                receivedByIds,
            }, { new: true }).populate("senderId");
            res
                .status(200)
                .json({ updatedMessage, conversation });
        }
        else {
            res.status(400).json("Unauthorized opération");
        }
    }
    catch (error) {
        res.status(500).json(error);
    }
});
router.put("/checkedBy/currentUser", async (req, res) => {
    var _a;
    const { conversationId } = req.body;
    const userId = req.user._id;
    console.log(userId);
    try {
        let haveBeenCheckedMessages = [];
        const messages = await models_1.MessageModel.find({
            conversationId,
            senderId: { $nin: [userId] },
            checkedByIds: { $nin: [userId] },
        });
        console.log({ messages });
        const conversation = await models_1.ConversationModel.findById(conversationId);
        let status;
        for (const message of messages) {
            if (!!conversation &&
                ((_a = conversation.membersId) === null || _a === void 0 ? void 0 : _a.map((m) => m.toString()).includes(userId.toString())) &&
                !message.checkedByIds
                    .map((c) => c.toString())
                    .includes(userId.toString())) {
                const checkedByIds = [
                    ...message.checkedByIds,
                    userId,
                ];
                if (areEqual(conversation === null || conversation === void 0 ? void 0 : conversation.membersId.map((mId) => mId.toString()).filter((mId) => mId !== message.senderId.toString()), checkedByIds.map((m) => m.toString()))) {
                    status = 40;
                }
                else {
                    status = message.status;
                }
                const updatedMessage = await models_1.MessageModel.findByIdAndUpdate(message._id, {
                    status,
                    checkedByIds,
                }, { new: true }).populate("senderId");
                haveBeenCheckedMessages = [
                    ...(haveBeenCheckedMessages || []),
                    updatedMessage._id.toString(),
                ];
            }
        }
        res.status(200).json(haveBeenCheckedMessages);
    }
    catch (error) {
        res.status(500).json(error);
    }
});
router.get("/lastOneOf/:conversationId", async (req, res) => {
    try {
        const messages = await models_1.MessageModel.find({
            conversationId: req.params.conversationId,
        })
            .sort({ createdAt: -1 })
            .limit(1);
        const lastMessage = messages[0];
        res.status(200).json(lastMessage);
    }
    catch (error) {
        res.status(500).json(error);
    }
});
router.get("/unchecked/currentUser/:conversationId", async (req, res) => {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;
    try {
        const messages = await models_1.MessageModel.find({
            $and: [
                { conversationId: conversationId },
                { checkedByIds: { $nin: [currentUserId] } },
                { senderId: { $nin: [currentUserId] } },
            ],
        });
        const notYetReceivedMessages = await models_1.MessageModel.updateMany({
            $and: [
                { conversationId: conversationId },
                { receivedByIds: { $nin: [currentUserId] } },
                { senderId: { $nin: [currentUserId] } },
            ],
        }, { $push: { receivedByIds: currentUserId } }, { new: true });
        console.log({ notYetReceivedMessages });
        res.status(200).json(messages);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
router.post("/array/fromIds", async (req, res) => {
    try {
        const { messagesIds } = req.body;
        const messages = await Promise.all(messagesIds.map((mId) => models_1.MessageModel.findById(mId).populate({
            path: "senderId",
        })));
        res.status(200).json(messages);
    }
    catch (error) {
        res.status(500).json(error);
    }
});
router.get("/:conversationId", async (req, res) => {
    try {
        const messages = await models_1.MessageModel.find({
            conversationId: req.params.conversationId,
        }).populate({ path: "senderId" });
        res.status(200).json(messages);
    }
    catch (error) {
        res.status(500).json(error);
    }
});
function areEqual(array1, array2) {
    if (array1.length === array2.length) {
        return array1.every((element) => {
            if (array2.includes(element)) {
                return true;
            }
            return false;
        });
    }
    return false;
}
exports.default = router;
//# sourceMappingURL=messages.js.map