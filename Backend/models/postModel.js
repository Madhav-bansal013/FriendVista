import mongoose, { Schema } from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Users" }, //connection with userModel
    description: { type: String, required: true },
    image: { type: String },
    likes: [{ type: String }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comments" }], //connect to comment model
  },
  { timestamps: true }
);

const Posts = mongoose.model("Posts", postSchema);

export default Posts;
