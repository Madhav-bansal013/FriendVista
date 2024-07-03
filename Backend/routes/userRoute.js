import express from "express";
import path from "path";
import {
  acceptRequest,
  changePassword,
  friendRequest,
  getFriendRequest,
  getUser,
  profileViews,
  requestResetPassword,
  resetPassword,
  suggestedFriends,
  updateUser,
  verifyEmail,
} from "../controllers/userController.js";
import userAuth from "../middleware/authMiddleware.js";
//Path module is used to work for differnt path in different os.

const router = express.Router();

const __dirname = path.resolve(path.dirname(""));

// resolve change sequence of paths into an absolute path.The path.dirname method returns the directory name of a path."" means curr dir

//verification route
router.get("/verify/:userId/:token", verifyEmail);
//when we trigger link in verify mail then this function executes and redirect to verified route where index.html served

//pass reset routes
router.post("/request-passwordreset", requestResetPassword);
router.get("/reset-password/:userId/:token", resetPassword);
router.post("/reset-password", changePassword);

//user routes
router.post("/get-user/:id?", userAuth, getUser); //? means optional if id is not there we are refering to our own profile

router.patch("/update-user", userAuth, updateUser);

//friend request
router.post("/friend-request", userAuth, friendRequest); //to send
router.post("/get-friend-request", userAuth, getFriendRequest); //to get all
router.post("/accept-request", userAuth, acceptRequest); //accept or deny req

// view profile
router.post("/profile-view", userAuth, profileViews);

//suggested friends
router.post("/suggested-friends", userAuth, suggestedFriends);

router.get("/verified", (req, res) => {
  res.sendFile(path.join(__dirname, "./dist/index.html"));
});

router.get("/resetpassword", (req, res) => {
  res.sendFile(path.join(__dirname, "./dist/index.html"));
});
export default router;

//path.join is used to create full path from this file to index.html file. send file is providing html file to the client
