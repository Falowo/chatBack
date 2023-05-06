import express from "express";
const router = express.Router();

import {
  checkedByCurrentUser,
  create,
  deleteMessage,
  getAllMessagesFromConversationId,
  getLastMessageOfConversation,
  getMessagesArrayFromMessagesIdsArray,
  getUncheckedMessagesByCurrentUserByConversationId,
  receivedByCurrentUser,
  updateMessage,
} from "../controllers/messagesControllers/messages.controller";

//create a message

router.post("/", create);

// message received by currentUser

router.put(
  "/receivedBy/currentUser",
  receivedByCurrentUser,
);

// all messages of a conversation are checked by currentUser

router.put("/checkedBy/currentUser", checkedByCurrentUser);

// get last message from a conversation

router.get(
  "/lastOneOf/:conversationId",
  getLastMessageOfConversation,
);

// get unchecked messages by current User for a conversationId

router.get(
  "/unchecked/currentUser/:conversationId",
  getUncheckedMessagesByCurrentUserByConversationId,
);

// get  messages array from messagesIds array

router.post(
  "/array/fromIds",
  getMessagesArrayFromMessagesIdsArray,
);

// get all messages from the conversation

router.get(
  "/:conversationId",
  getAllMessagesFromConversationId,
);

// delete a message
router.delete("/:messageId", deleteMessage);

// update a message
router.put("/:messageId", updateMessage);

export default router;
