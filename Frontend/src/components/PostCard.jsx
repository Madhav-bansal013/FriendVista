import { useState } from "react";
import { Link } from "react-router-dom";
import { NoProfile } from "../assets";
import moment from "moment";
import { BiComment, BiLike, BiSolidLike } from "react-icons/bi";
import { MdDeleteOutline } from "react-icons/md";
import { useForm } from "react-hook-form";
import TextInput from "./TextInput";
import Loading from "./Loading";
import CustomButton from "./CustomButton";
import { apiRequest } from "../utils";

const getPostComment = async (id) => {
  try {
    const res = await apiRequest({
      url: "/posts/comments/" + id,
      method: "GET",
    });

    return res?.data;
  } catch (error) {
    console.log(error);
  }
};

const CommentForm = ({ user, id, getComments }) => {
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setErrMsg("");

    try {
      const url = "/posts/comment/" + id;

      const newData = {
        comment: data?.comment,
        from: user?.firstName + " " + user?.lastName,
      };

      const res = await apiRequest({
        url,
        data: newData,
        token: user?.token,
        method: "POST",
      });

      if (res?.status === "failed") {
        setErrMsg(res);
      } else {
        reset({
          comment: "",
        });

        setErrMsg("");

        await getComments(id);
        setLoading(false);
      }
    } catch (error) {}
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full pb-2 border-b border-[#66666645]"
    >
      <div className="w-full flex items-center gap-2 py-4">
        <img
          src={user?.profileUrl ?? NoProfile}
          alt="User image"
          className="w-10 h-10 object-cover rounded-full"
        />
        <TextInput
          styles="w-full rounded-full py-3"
          name="comment"
          placeholder={"Comment this post!"}
          register={register("comment", {
            required: "Comment can not be empty",
          })}
          error={errors.comment ? errors.comment.message : ""}
        />
      </div>
      {errMsg?.message && (
        <span
          role="alert"
          className={`text-sm ${
            errMsg?.status === "failed"
              ? "text-[#f64949fe]"
              : "text-[#2ba150fe]"
          } mt-1`}
        >
          {errMsg?.message}
        </span>
      )}

      <div className="flex items-end justify-end pb-2">
        {loading ? (
          <Loading />
        ) : (
          <CustomButton
            title="Submit"
            type="submit"
            containerStyles="bg-pink text-white py-1 px-3 rounded-full font-semibold text-sm"
          />
        )}
      </div>
    </form>
  );
};

const PostCard = ({ post, user, deletePost, likePost }) => {
  const [showAll, setShowAll] = useState(0);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(0);

  const getComments = async (postId) => {
    const res = await getPostComment(postId);

    setComments(res);
    setLoading(false);
  };

  const handleLike = async (uri) => {
    await likePost(uri); //in props
    await getComments(post?._id);
  };
  return (
    <div className="bg-primary mb-2 p-4 rounded-lg">
      {/* user profile who posted */}
      <div className="flex items-center gap-3 mb-2">
        <Link to={"/profile/" + post?.userId?._id}>
          <img
            src={post?.userId?.profileUrl ?? NoProfile}
            alt={post?.userId?.firstName}
            className="w-14 h-14 object-cover rounded-full"
          />
        </Link>
        <div className="w-full flex justify-between">
          <div>
            <Link to={"/profile/" + post?.userId?._id}>
              <p className="text-ascent-1 font-medium text-lg">
                {post?.userId?.firstName} {post?.userId?.lastName}
              </p>
            </Link>
            <span className="text-sm text-ascent-2">
              {post?.userId?.location ?? "No Location"}
            </span>
          </div>

          <span className="text-ascent-2 text-sm pt-1">
            {moment(post?.createdAt ?? "2024-06-17").fromNow()}
          </span>
        </div>
      </div>

      {/* post description*/}
      <div>
        <p className="text-ascent-2">
          {
            showAll === post?._id
              ? post?.description
              : post?.description.slice(0, 350)

            //we only show full description when post is opened
          }
          {post?.description?.length > 350 &&
            (showAll === post?._id ? (
              <span
                className="text-pink ml-2 font-medium cursor-pointer"
                onClick={() => setShowAll(0)}
              >
                Show Less
              </span>
            ) : (
              <span
                className="text-pink ml-2 font-medium cursor-pointer"
                onClick={() => setShowAll(post?._id)}
              >
                Show More...
              </span>
            ))}
        </p>

        {post?.image ? (
          <img
            className="mt-4 w-full rounded-lg"
            src={post?.image}
            alt="post image"
          />
        ) : post?.video ? (
          <video
            className="mt-4 w-full rounded-lg"
            src={post?.video}
            controls
            alt="post video"
          />
        ) : (
          ""
        )}
      </div>
      {/* Likes and comment icon */}
      <div className="mt-4 flex justify-between items-center px-3 py-2 text-ascent-2 text-base border-t border-[#66666645]">
        {/* likes */}
        <p
          className="flex items-center gap-2 text-base cursor-pointer"
          onClick={() => handleLike("/posts/like/" + post?._id)}
        >
          {
            //if likes id contains user id then liked is done by user showing solid like icon
            post?.likes?.includes(user?._id) ? (
              <BiSolidLike size={20} color="pink" />
            ) : (
              <BiLike size={20} color="pink" />
            )
          }
          {post?.likes?.length} Likes
        </p>

        {/* Comments length and icon*/}
        <p
          className="flex items-center gap-2 text-base cursor-pointer"
          onClick={() => {
            const newShowComments =
              showComments === post?._id ? null : post?._id;
            setShowComments(newShowComments);
            if (newShowComments) {
              getComments(post?._id);
            }
          }}
        >
          <BiComment size={20} />
          {post?.comments?.length} Comments
        </p>
        {user?._id === post?.userId?._id && (
          <div
            className="flex items-center text-base text-ascent-2 cursor-pointer gap-1"
            onClick={() => deletePost(post?._id)}
          >
            <MdDeleteOutline size={20} />
            <span>Delete</span>
          </div>
        )}
      </div>

      {/* Comments Section */}

      {showComments === post._id && (
        <div className="w-full mt-4 border-t border-[#66666645] pt-4">
          <CommentForm
            user={user}
            id={post._id}
            getComments={() => {
              getComments(post?._id);
            }}
          />

          {loading ? (
            <Loading />
          ) : comments?.length > 0 ? (
            comments.map((comment) => (
              <div className="w-full py-2" key={comment?._id}>
                <div className="flex items-center gap-3 mb-1">
                  <Link to={"/profile/" + comment?.userId?._id}>
                    <img
                      src={comment?.userId?.profileUrl ?? NoProfile}
                      alt={comment?.userId?.firstName}
                      className="w-10 h-10 object-cover rounded-full"
                    />
                  </Link>

                  <div>
                    <Link to={"/profile/" + comment?.userId?._id}>
                      <p className="text-sm text-ascent-2">
                        {comment?.userId?.firstName} {comment?.userId?.lastName}{" "}
                      </p>
                    </Link>
                    <span className="text-sm text-ascent-2">
                      {moment(comment?.createdAt ?? "2024-06-17").fromNow()}
                    </span>
                  </div>
                </div>

                <div className="ml-14">
                  <p className="text-ascent-2">{comment?.comment}</p>

                  <div className="mt-2 flex gap-6">
                    <p
                      className="flex items-center gap-2 text-base cursor-pointer text-ascent-2"
                      onClick={() => {
                        handleLike("/posts/like-comment/" + comment?._id);
                      }}
                    >
                      {comment?.likes?.includes(user?._id) ? (
                        <BiSolidLike size={20} color="pink" />
                      ) : (
                        <BiLike size={20} color="pink" />
                      )}
                      {comment?.likes?.length} Likes
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <span className="flex text-sm py-4 text-ascent-2 text-center">
              No Comments, be the first to comment
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
