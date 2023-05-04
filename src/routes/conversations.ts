import express from "express";
const router = express.Router();

import {
  addMember,
  create,
  deleteOne,
  getAllOfUser,
  getLastEditedConversation,
  getOneById,
  getPrivateConversation,
  removeMember,
  update,
} from "../controllers/conversationsControllers/conversations.controller";
//create a conversation

router.post("/", create);
//update a conv

router.put("/:id", update);
//delete a conv

router.delete("/:id", deleteOne);

// get a private conversation by userId

router.get("/private/:userId", getPrivateConversation);

// get a conversation by id
router.get("/one/:id", getOneById);

// get last edited conversation of a user

router.get("/last", getLastEditedConversation);

//get the conversations of the currentUser

router.get("/allOfUser", getAllOfUser);

// add a member

router.put("/addMembers/:conversationId", addMember);

// remove a member
router.put("/removeMembers/:conversationId", removeMember);

export default router;
