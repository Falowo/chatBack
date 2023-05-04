import express from "express";
const router = express.Router();

import {
  checkedByCurrentUser,
  create,
  getAllMessagesFromConversationId,
  getLastMessageOfConversation,
  getMessagesArrayFromMessagesIdsArray,
  getUncheckedMessagesByCurrentUserByConversationId,
} from "../controllers/messagesControllers/messages.controller";

//create a message

router.post("/", create);

// message received by currentUser

router.put("/receivedBy/currentUser");

// all messages of a conversation are checked by currentUser

router.put("/checkedBy/currentUser", checkedByCurrentUser);

// get last message from a conversation

router.get(
  "/lastOneOf/:conversationId",
  getLastMessageOfConversation
);

// get unchecked messages by current User for a conversationId

router.get(
  "/unchecked/currentUser/:conversationId",
  getUncheckedMessagesByCurrentUserByConversationId
);

// get  messages array from messagesIds array

router.post(
  "/array/fromIds",
  getMessagesArrayFromMessagesIdsArray
);

// get all messages from the conversation

router.get(
  "/:conversationId",
  getAllMessagesFromConversationId
);

export default router;
