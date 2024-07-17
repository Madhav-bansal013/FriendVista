import Posts from "../models/postModel.js";
import Users from "../models/userModel.js";
import Comments from "../models/commentModel.js";

export const createPost = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { description, image } = req.body;

    if (!description) {
      next("You must provide a description!");
      return;
    }
    //else create a post
    const post = await Posts.create({
      userId,
      description,
      image,
    });

    res.status(200).json({
      sucess: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { search } = req.body;

    const user = await Users.findById(userId);
    const friends = user?.friends ?? []; //if no friends or user empty array
    friends.push(userId);

    const searchPostQuery = {
      $or: [
        { description: { $regex: search, $options: "i" } }, //case insensitive
      ],
    };

    const posts = await Posts.find(search ? searchPostQuery : {})
      .populate({
        path: "userId", //ref to user model
        select: "firstName lastName location profileUrl -password",
      })
      .sort({ _id: -1 }); //sort by id of post in desc

    const friendPosts = posts?.filter((post) => {
      return friends.includes(post.userId._id.toString()); //return friend posts on the basis of friends id array
    });

    const otherPosts = posts?.filter((post) => {
      return !friends.includes(post.userId._id.toString()); //return other posts
    });

    let postRes = null;

    if (friendPosts?.length > 0) {
      postRes = search ? friendPosts : [...friendPosts, ...otherPosts]; //search only in friend posts. if search is not there then spread friend post first and then other posts
    } else {
      postRes = posts;
    }

    res.status(200).json({
      sucess: true,
      message: "Success!",
      data: postRes,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getPost = async (req, res) => {
  try {
    const { id } = req.params; //postid
    //find post by post id
    const post = await Posts.findById(id).populate({
      path: "userId", //ref to user model
      select: "firstName lastName location profileUrl -password",
    });

    res.status(200).json({
      sucess: true,
      message: "Success!",
      data: post,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getUserPost = async (req, res) => {
  try {
    const { id } = req.params; //userid
    //find posts of userid
    const post = await Posts.find({ userId: id })
      .populate({
        path: "userId", //ref to user model
        select: "firstName lastName location profileUrl -password",
      })
      .sort({ _id: -1 });

    res.status(200).json({
      sucess: true,
      message: "Success!",
      data: post,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comments.find({ postId })
      .populate({
        path: "userId", //to get user info who commented
        select: "firstName lastName location profileUrl -password",
      })
      //     .populate({
      //       path: "replies.userId",
      //       select: "firstName lastName location profileUrl -password",
      //     })
      //   to get info of user who replied to comment
      .sort({ _id: -1 });

    res.status(200).json({
      sucess: true,
      message: "Success!",
      data: comments,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { id } = req.params;

    const post = await Posts.findById(id);

    const index = post.likes.findIndex((pid) => pid === String(userId)); //find index of user like in like arr of post

    if (index === -1) {
      post.likes.push(userId); //push like
    } else {
      post.likes = post.likes.filter((pid) => pid != String(userId));
      //remove like of user for unlike
    }

    const newPost = await Posts.findByIdAndUpdate(id, post, {
      new: true, //return updated document
    });

    res.status(200).json({
      sucess: true,
      message: "Success!",
      data: newPost,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const likePostComment = async (req, res) => {
  const { userId } = req.body.user;
  const { id } = req.params; //comment id

  try {
    const comment = await Comments.findById(id);

    const index = comment.likes.findIndex((el) => el === String(userId));

    if (index === -1) {
      comment.likes.push(userId); //push new like
    } else {
      comment.likes = comment.likes.filter((i) => i !== String(userId)); //unlike
    }

    const updated = await Comments.findByIdAndUpdate(id, comment, {
      new: true,
    });

    res.status(201).json(updated);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const commentPost = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { comment, from } = req.body;
    const { id } = req.params; //post id

    if (comment === null || from === null) {
      res.status(400).json({ message: "Comment and from is required" });
    }

    const newComment = await Comments.create({
      comment,
      from,
      userId,
      postId: id,
    });

    //updating comment id in post model

    const post = await Posts.findById(id);
    post.comments.push(newComment._id);
    await post.save();

    res.status(200).json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params; //post id

    await Posts.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
