import express, { Response } from "express";
import { AppRequest } from "../config/jwt.config";
const router = express.Router();
import { ConversationModel, UserModel } from "../models/";

//create a conversation

router.post("/", async (req: AppRequest, res: Response) => {
  const { receiversId } = req.body;
  let { groupName } = req.body;

  try {
    const sender = req.user;
    const receivers = await Promise.all(
      receiversId.map((r) => UserModel.findById(r)),
    );
    if (receivers.includes(null)) {
      // console.log({ receivers });
      res
        .status(400)
        .json("you are trying an unauthorized operation !");
    } else {
      if (!groupName) {
        if (receiversId?.length > 1) {
          groupName = `${receivers[0]}, ${
            receivers[1]
          } and ${receivers.length - 2} others ...`;
        }
      }
      const newConversation = new ConversationModel({
        ...req.body,
        membersId: [sender._id!, ...receiversId],
        adminsId: [sender._id],
        groupName,
      });
      const savedConversation =
        await newConversation.save();
      res.status(200).json(savedConversation);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});
//update a conv

router.put(
  "/:id",
  async (req: AppRequest, res: Response) => {
    try {
      const conversation = await ConversationModel.findById(
        req.params.id,
      );

      if (
        conversation.membersId
          ?.map((m) => m.toString())
          .includes(req.user._id.toString()) &&
        req.user._id.toString() === req.user._id.toString()
      ) {
        const updatedConversation =
          await conversation.updateOne({
            $set: { ...req.body.conversation },
          });
        res.status(200).json(updatedConversation);
      } else {
        res
          .status(403)
          .json("you are not member of this conversation");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  },
);
//delete a conv

router.delete(
  "/:id",
  async (req: AppRequest, res: Response) => {
    try {
      const conversation = await ConversationModel.findById(
        req.params.id,
      );
      if (
        conversation.adminsId
          ?.map((a) => a.toString())
          .includes(req.user._id.toString())
      ) {
        await conversation.deleteOne();
        res
          .status(200)
          .json("the conversation has been deleted");
      } else {
        res
          .status(403)
          .json("you can delete only your conversations");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  },
);

// get a private conversation by userId

router.get(
  "/private/:userId",
  async (req: AppRequest, res: Response) => {
    const userId = req.params.userId;
    const currentUser = req.user;
    try {
      const conversation = await ConversationModel.findOne({
        $or: [
          { membersId: [userId, currentUser._id!] },
          { membersId: [currentUser._id!, userId] },
        ],
      });

      res.status(200).json(conversation);
    } catch (e) {
      console.log(e);
      res.status(400).json("oups");
    }
  },
);

// get a conversation by id
router.get(
  "/one/:id",
  async (req: AppRequest, res: Response) => {
    try {
      const post = await ConversationModel.findById(
        req.params.id,
      );
      res.status(200).json(post);
    } catch (err) {
      res.status(500).json(err);
    }
  },
);

// get last edited conversation of a user

router.get(
  "/last",
  async (req: AppRequest, res: Response) => {
    const currentUser = req.user;
    try {
      const lastConversation = await ConversationModel.find(
        {
          membersId: { $all: [currentUser._id] },
        },
      )
        .sort({ updatedAt: -1 })
        .limit(1);
      res.status(200).json(lastConversation);
    } catch (e) {
      res.status(500).json(e);
    }
  },
);

//get the conversations of the currentUser

router.get(
  "/",
  async (req: AppRequest, res: Response) => {

    try {
      const conversations = await ConversationModel.find({
        membersId: { $in: req.user._id },
      }).sort({ updatedAt: -1 });

      const populatedConversations = await Promise.all(
        conversations.map((c) =>
          c.populate("lastMessageId"),
        ),
      );
      // console.log({ populatedConversations });

      res.status(200).json(populatedConversations);
    } catch (err) {
      res.status(500).json(err);
    }
  },
);

// add a member

router.put(
  "/addMembers/:conversationId",
  async (req: AppRequest, res: Response) => {
    const { newMembersId, inviterId } = req.body;
    const { conversationId } = req.params;

    try {
      const conversation = await ConversationModel.findById(
        conversationId,
      );
      // console.log(conversation);

      const inviter = await UserModel.findById(inviterId);

      // console.log(inviter);

      const newMembers = await Promise.all(
        newMembersId.map((n) => UserModel.findById(n)),
      );

      // console.log({ newMembers });

      if (
        !conversation ||
        !inviter ||
        newMembers.includes(null)
      ) {
        res.status(400).json(
          `You are trying to deal with unexisting datas:
            ${!conversation && "conversation"}
            ${!inviter && "inviter"}
            ${
              newMembers.includes(null) &&
              "one newMember doesn't exist"
            }
            `,
        );
      } else if (
        !conversation.adminsId
          .map((a) => a.toString())
          .includes(inviterId)
      ) {
        res
          .status(400)
          .json(
            "You are not allowed to invite people in this conversation, you should ask an admin to do it",
          );
      } else {
        for (const n of newMembersId) {
          if (conversation.membersId.includes(n)) {
            res
              .status(400)
              .json(
                "You are trying to invite members already inside room",
              );
            return;
          }
        }
        const c = await ConversationModel.findByIdAndUpdate(
          conversationId,
          {
            $set: {
              membersId: [
                ...conversation.membersId,
                ...newMembersId,
              ],
            },
          },
          { runValidators: true, new: true },
        );
        res.status(200).json(c);
      }
    } catch (error) {
      res.status(500).json(error);
    }
  },
);

router.put(
  "/removeMembers/:conversationId",
  async (req: AppRequest, res: Response) => {
    let e = 0;
    const { leavingMembersId} = req.body;
    const { conversationId } = req.params;


    try {
      const conversation = await ConversationModel.findById(
        conversationId,
      );
      const currentUser = await UserModel.findById(req.user._id);

      if (
        !currentUser.isAdmin ||
        !conversation.adminsId
          .map((a) => a.toString())
          .includes(currentUser._id.toString())
      ) {
        if (
          leavingMembersId.length > 1 ||
          leavingMembersId[0] !== currentUser._id.toString()
        ) {
          e++;
          res
            .status(400)
            .json(
              "Only an admin is allowed to do this opération",
            );
        }
      }
      if (
        currentUser.isAdmin ||
        leavingMembersId.length === 1 ||
        conversation.adminsId
          .map((a) => a.toString())
          .includes(currentUser._id.toString())
      ) {
        const leavingMembers = await Promise.all(
          leavingMembersId.map((l) =>
            UserModel.findById(l),
          ),
        );
        // console.log({ leavingMembers });

        if (
          !conversation ||
          !currentUser ||
          leavingMembers.includes(null)
        ) {
          e++;
          res
            .status(400)
            .json(
              "You are trying to deal with unexisting datas !",
            );
        } else {
          for (const l of leavingMembersId) {
            if (!conversation.membersId.includes(l)) {
              e++;
              res
                .status(400)
                .json(
                  "You are trying to fire members not inside conversation",
                );
              break;
            }
          }
        }
        if (e === 0) {
          const updatedMembersId =
            conversation.membersId.filter(
              (m) =>
                !leavingMembersId.includes(m.toString()),
            );
          // console.log({ updatedMembersId });
          const c =
            await ConversationModel.findByIdAndUpdate(
              conversationId,
              {
                $set: {
                  membersId: updatedMembersId,
                },
              },
              { runValidators: true, new: true },
            );
          res.status(200).json(c);
        }
      }
    } catch (error) {
      res.status(500).json(error);
    }
  },
);

export default router;
