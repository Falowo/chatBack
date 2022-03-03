import express, { Response } from "express";
import { AppRequest } from "../config/jwt.config";
const router = express.Router();
import {
  MessageModel,
  ConversationModel,
  // UserModel,
} from "../models/";

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

// message received by a conversation Member

router.put(
  "/received",
  async (req: AppRequest, res: Response) => {
    const { messageId, userId } = req.body;

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
          );

        res.status(200).json(updatedMessage);
      } else {
        res.status(400).json("Unauthorized opération");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  },
);

// all messages checked by a conversation Member

router.put(
  "/checked",
  async (req: AppRequest, res: Response) => {
    const { conversationId, userId } = req.body;

    try {
      const messages = await MessageModel.find({
        conversationId,
        senderId: { $nin: [userId] },
        checkedByIds: { $nin: [userId] },
      });

      console.log({ messages });

      const conversation = await ConversationModel.findById(
        conversationId,
      );
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

          // const updatedMessage =
          await MessageModel.findByIdAndUpdate(
            message._id,
            {
              status,
              checkedByIds,
            },
            { new: true },
          );
        }
      }

      res.status(200).json("messages.checked");
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
