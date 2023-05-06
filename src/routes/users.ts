import express from "express";
const router = express.Router();

import {
  addFriend,
  checkAcceptedFriendRequest,
  deleteUser,
  editCoverPicture,
  editCurrentUserDescription,
  editCurrentUserInfos,
  editProfilePicture,
  getAllUsersMatchingSearch,
  getBestCurrentUserFriends,
  getFriendByUserIdParams,
  getFriendRequestsFrom,
  getUser,
  removeFriend,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  updateUserSensitiveDatas,
} from "../controllers/usersControllers/users.controller";

//update user sensitive data
router.put("/:id", updateUserSensitiveDatas);

//delete user
router.delete("/:id", deleteUser);

//get a user by query
router.get("/", getUser);

// get all users matching search

router.get("/search/:search", getAllUsersMatchingSearch);

//get friends
router.get(
  "/best/currentUser/friends",
  getBestCurrentUserFriends,
);

//get friends
router.get("/friends/:userId", getFriendByUserIdParams);

// get friendsrequestsFrom

router.get("/friend/requests/from", getFriendRequestsFrom);

// send or accept friend request

router.put("/:friendRequestId/sendFriendRequest", sendFriendRequest);

router.put("/:friendRequestId/acceptFriendRequest", acceptFriendRequest);

router.put("/:friendRequestId/declineFriendRequest", declineFriendRequest);


// checkFriendRequests
router.put(
  "/currentUser/checkFriendRequests",
  getFriendRequestsFrom,
);
// checkAcceptedFriendRequests
router.put(
  "/currentUser/checkAcceptedFriendRequests",
  checkAcceptedFriendRequest,
);

// addFriend

router.put("/:id/addFriend", addFriend);

// edit profile picture
router.put(
  "/currentUser/editProfilePicture",
  editProfilePicture,
);
// edit cover picture
router.put(
  "/currentUser/editCoverPicture",
  editCoverPicture,
);

// update currentUser info
router.put("/currentUser/updateInfo", editCurrentUserInfos);

// update currentUser desc
router.put(
  "/currentUser/updateDesc",
  editCurrentUserDescription,
);

router.put("/:id/removeFriend", removeFriend);

export default router;
