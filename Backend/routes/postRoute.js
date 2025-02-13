import express from "express";
import userAuth from "../middleware/authMiddleware.js";
import {
  commentPost,
  createPost,
  deletePost,
  getComments,
  getPost,
  getPosts,
  getUserPost,
  likePost,
  likePostComment,
} from "../controllers/postController.js";

const router = express.Router();

//create post
router.post("/create-post", userAuth, createPost);

//get post
router.post("/", userAuth, getPosts);

// get particular post
router.post("/:id", userAuth, getPost);

//user posts
router.post("/get-user-post/:id", userAuth, getUserPost);

// get comments
router.get("/comments/:postId", getComments);

//like and comment post
router.post("/like/:id", userAuth, likePost);
router.post("/like-comment/:id", userAuth, likePostComment);
router.post("/comment/:id", userAuth, commentPost);

//delete post
router.delete("/:id", userAuth, deletePost);
export default router;
