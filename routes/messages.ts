import express, { Response } from "express";
import { AppRequest } from "../config/jwt.config";
const router = express.Router();
import {
  MessageModel,
  ConversationModel,
  // UserModel,
} from "../models/";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";

//create a message

router.post("/", async (req: AppRequest, res: Response) => {
  const { senderId, conversationId } = req.body;

  try {
    const conversation = await ConversationModel.findById(
      conversationId,
    );
    if (
      !!conversation &&
      senderId.toString() === req.user._id.toString() &&
      conversation.membersId
        ?.map((m) => m.toString())
        .includes(req.user._id.toString())
    ) {
      const newMessage = new MessageModel({
        ...req.body,
        status: 20,
      });
      const savedMessage = await newMessage.save();
      const populatedMessage = await savedMessage.populate(
        "senderId",
      );

      const updatedConversation =
        await ConversationModel.findByIdAndUpdate(
          conversation._id,
          {
            lastMessageId: savedMessage._id,
            $push: { pendingMessagesIds: savedMessage._id },
          },
          { new: true },
        );

      console.log({ updatedConversation });

      res.status(200).json(populatedMessage);
    } else {
      res.status(400).json("Unauthorized opération");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// message received by currentUser

router.put(
  "/receivedBy/currentUser",
  async (req: AppRequest, res: Response) => {
    const { messageId } = req.body;
    const userId = req.user._id;
    try {
      const message = await MessageModel.findById(
        messageId,
      );
      const conversation = await ConversationModel.findById(
        message.conversationId,
      );
      let status: Number;

      if (
        !!conversation &&
        conversation.membersId
          ?.map((m) => m.toString())
          .includes(userId.toString()) &&
        !message.receivedByIds
          .map((r) => r.toString())
          .includes(userId.toString())
      ) {
        const receivedByIds = [
          ...message.receivedByIds,
          userId,
        ];

        if (
          areEqual(
            conversation?.membersId
              .map((mId) => mId.toString())
              .filter(
                (mId) =>
                  mId !== message.senderId.toString(),
              ),
            receivedByIds.map((m) => m.toString()),
          )
        ) {
          status = 30;
        } else {
          status = message.status ? message.status : 20;
        }

        const updatedMessage =
          await MessageModel.findByIdAndUpdate(
            message._id,
            {
              status,
              receivedByIds,
            },
            { new: true },
          ).populate("senderId");

        res
          .status(200)
          .json({ updatedMessage, conversation });
      } else {
        res.status(400).json("Unauthorized opération");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  },
);

// all messages of a conversation are checked by currentUser

router.put(
  "/checkedBy/currentUser",
  async (req: AppRequest, res: Response) => {
    const { conversationId } = req.body;
    const userId = req.user._id;
    console.log(userId);

    try {
      let haveBeenCheckedMessages: string[] = [];

      const messages: Message[] = await MessageModel.find({
        conversationId,
        senderId: { $nin: [userId] },
        checkedByIds: { $nin: [userId] },
      });

      console.log({ messages });

      const conversation: Conversation =
        await ConversationModel.findById(conversationId);
      let status: Number;
      for (const message of messages) {
        if (
          !!conversation &&
          conversation.membersId
            ?.map((m) => m.toString())
            .includes(userId.toString()) &&
          !message.checkedByIds
            .map((c) => c.toString())
            .includes(userId.toString())
        ) {
          const checkedByIds = [
            ...message.checkedByIds,
            userId,
          ];

          // change the message status and quit the message id from pendingMessagesIds (conversation)

          if (
            areEqual(
              conversation?.membersId
                .map((mId) => mId.toString())
                .filter(
                  (mId) =>
                    mId !== message.senderId.toString(),
                ),
              checkedByIds.map((m) => m.toString()),
            )
          ) {
            status = 40;

            if (
              !!conversation.pendingMessagesIds
                .map((p) => p.toString())
                .includes(message._id.toString())
            ) {
              const updatedConversation =
                await ConversationModel.findByIdAndUpdate(
                  conversation._id,
                  {
                    $pull: {
                      pendingMessagesIds: message._id,
                    },
                  },
                  { new: true },
                );
              console.log(updatedConversation);
            }
          } else {
            status = message.status ? message.status : 20;
          }

          const updatedMessage =
            await MessageModel.findByIdAndUpdate(
              message._id,
              {
                status,
                checkedByIds,
              },
              { new: true },
            ).populate("senderId");

          haveBeenCheckedMessages = [
            ...(haveBeenCheckedMessages || []),
            updatedMessage._id.toString(),
          ];
        }
      }
      res.status(200).json(haveBeenCheckedMessages);
    } catch (error) {
      res.status(500).json(error);
    }
  },
);

// get last message from a conversation

router.get(
  "/lastOneOf/:conversationId",
  async (req: AppRequest, res: Response) => {
    try {
      const messages = await MessageModel.find({
        conversationId: req.params.conversationId,
      })
        .sort({ createdAt: -1 })
        .limit(1);
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json(error);
    }
  },
);

// get unchecked messages by current User for a conversationId

router.get(
  "/unchecked/currentUser/:conversationId",
  async (req: AppRequest, res: Response) => {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;

    try {
      const messages = await MessageModel.find({
        $and: [
          { conversationId: conversationId },
          { checkedByIds: { $nin: [currentUserId] } },
          { senderId: { $nin: [currentUserId] } },
        ],
      });
      // find not yet received and automatically receive
      const notYetReceivedMessages =
        await MessageModel.updateMany(
          {
            $and: [
              { conversationId: conversationId },
              { receivedByIds: { $nin: [currentUserId] } },
              { senderId: { $nin: [currentUserId] } },
            ],
          },
          { $push: { receivedByIds: currentUserId } },
          { new: true },
        );

      console.log({notYetReceivedMessages});

      res.status(200).json(messages);
    } catch (error) {
      res.status(400).json(error);
    }
  },
);

// get  messages array from messagesIds array

router.post(
  "/array/fromIds",
  async (req: AppRequest, res: Response) => {
    try {
      const { messagesIds } = req.body;
      const messages = await Promise.all(
        messagesIds.map((mId) =>
          MessageModel.findById(mId).populate({
            path: "senderId",
          }),
        ),
      );
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json(error);
    }
  },
);

// get all messages from the conversation

router.get(
  "/:conversationId",
  async (req: AppRequest, res: Response) => {
    try {
      const messages = await MessageModel.find({
        conversationId: req.params.conversationId,
      }).populate({ path: "senderId" });
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json(error);
    }
  },
);

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

export default router;
