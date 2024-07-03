import Verification from "../models/emailVerification.js";
import FriendRequest from "../models/friendRequest.js";
import Users from "../models/userModel.js";
import { compareString, createJWT, hashedString } from "../utils/index.js";
import PasswordReset from "../models/passwordReset.js";
import { resetPasswordLink } from "../utils/sendEmail.js";

export const verifyEmail = async (req, res) => {
  const { userId, token } = req.params;

  try {
    const result = await Verification.findOne({ userId });

    if (result) {
      const { expiresAt, token: hashedToken } = result;
      //check token expiry
      if (expiresAt < Date.now()) {
        //if expired remove data from both model
        Verification.findOneAndDelete({ userId })
          .then(() => {
            Users.findOneAndDelete({ _id: userId })
              .then(() => {
                const message = "Verification token has expired!";

                res.redirect(`/users/verified?status=error&message=${message}`);
              })
              .catch((err) => {
                res.redirect(`/users/verified?status=error&message=`);
              });
          })
          .catch((error) => {
            console.log(error);
            res.redirect(`/users/verified?message=`);
          });
      } else {
        //token valid
        compareString(token, hashedToken)
          .then((isMatch) => {
            if (isMatch) {
              Users.findOneAndUpdate({ _id: userId }, { verified: true }) //if token match delete the data in verification model
                .then(() => {
                  Verification.findOneAndDelete({ userId }).then(() => {
                    const message = "Email verified successfully";
                    res.redirect(
                      `/users/verified?status=success&message=${message}`
                    );
                  });
                })
                .catch((err) => {
                  console.log(err);
                  const message = "Verification failed or link is invalid";
                  res.redirect(
                    `/users/verified?status=error&message=${message}`
                  );
                });
            } else {
              // invalid token
              const message = "Verification failed or link is invalid";
              res.redirect(`/users/verified?status=error&message=${message}`);
            }
          })
          .catch((err) => {
            console.log(err);
            res.redirect(`/users/verified?message=`);
          });
      }
    } else {
      const message = "Invalid link. Try again later";
      res.redirect(`/users/verified?status=error&message=${message}`);
    }
  } catch (error) {
    console.log(error);
    res.redirect(`/users/verified?message=`);
  }
};

export const requestResetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "Email not found",
      });
    }
    const existingReq = await PasswordReset.findOne({ email });

    if (existingReq) {
      if (existingReq.expiresAt > Date.now()) {
        return res.status(201).json({
          status: "pending",
          message: "Reset password link has already been sent to your email",
        });
      }
      //if reset req expires than delete req
      await PasswordReset.findOneAndDelete({ email });
    }
    //if reset req did not exist then send
    await resetPasswordLink(user, res);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { userId, token } = req.params;

  try {
    const user = await Users.findById(userId);

    if (!user) {
      //redirect to html file route
      const message = "Invalid password reset link. Try again";
      res.redirect(`/users/resetpassword?status=error&message=${message}`);
    }

    const resetPassword = await PasswordReset.findOne({ userId });

    //if not in db
    if (!resetPassword) {
      const message = "Invalid password reset link. Try again";
      res.redirect(`/users/resetpassword?status=error&message=${message}`);
    }
    //destructure only when it is in db
    else {
      const { expiresAt, token: resetToken } = resetPassword;

      //if link expired
      if (expiresAt < Date.now()) {
        const message = "Reset password link has expired. Try again";
        res.redirect(`/users/resetpassword?status=error&message=${message}`);
      }
      //if link is valid
      else {
        const isMatch = compareString(token, resetToken);

        if (!isMatch) {
          const message = "Invalid password reset link. Try again";
          res.redirect(`/users/resetpassword?status=error&message=${message}`);
        } else {
          res.redirect(`/users/resetpassword?type=reset&id=${userId}`);
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId, password } = req.body;

    const hashedpassword = await hashedString(password);

    const user = await Users.findByIdAndUpdate(
      { _id: userId },
      { password: hashedpassword }
    );

    if (user) {
      await PasswordReset.findOneAndDelete({ userId });

      res.status(200).json({
        ok: true,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const { userId } = req.body.user; //from middleware
    const { id } = req.params;

    const user = await Users.findById(id ?? userId).populate({
      // ?? means if no id then take logged in userID
      path: "friends",
      select: "-password", //do not select password of friends
    });

    if (!user) {
      return res.status(404).send({
        message: "user not found",
        success: false,
      });
    } else {
      user.password = undefined; //do not want to send user password to frontend
      res.status(200).send({
        user: user,
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, location, profileUrl, profession } = req.body;

    if (!(firstName || lastName || profession || location)) {
      next("Please provide all required fields");
      return;
    }

    const { userId } = req.body.user;

    const updateUser = {
      firstName,
      lastName,
      location,
      profileUrl,
      profession,
      _id: userId,
    };
    const user = await Users.findByIdAndUpdate(userId, updateUser, {
      new: true,
    }); //new:true gives updated document

    await user.populate({ path: "friends", select: "-password" });

    // const token = createJWT(user?._id);
    //new token for updated user as old token can contain old user details not in our case as we have only id

    user.password = undefined;

    res.status(200).json({
      sucess: true,
      message: "User updated successfully",
      user,
      // token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const friendRequest = async (req, res, next) => {
  try {
    const { userId } = req.body.user; //from auth middle

    const { requestTo } = req.body;

    //check in db if req exist
    const reqExist = await FriendRequest.findOne({
      requestFrom: userId,
      requestTo,
    });

    if (reqExist) {
      next("Friend request already sent.");
      return;
    }

    //check if second user has already sent the req
    const alreadyExist = await FriendRequest.findOne({
      requestFrom: requestTo,
      requestTo: userId,
    });

    if (alreadyExist) {
      next("Friend request cccalready sent.");
      return;
    }

    const newReq = await FriendRequest.create({
      requestFrom: userId,
      requestTo,
    });

    res.status(201).json({
      sucess: true,
      message: "Friend request sent successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const getFriendRequest = async (req, res, next) => {
  try {
    const { userId } = req.body.user; //from auth middle

    //get req that is pending and received by the logged in user
    const request = await FriendRequest.find({
      requestTo: userId,
      requestStatus: "Pending",
    })
      .populate({
        //take their info of particular id from user model as we have ref
        path: "requestFrom",
        select: "firstName lastName profileUrl profession -password",
      })
      .limit(10) //limit up to 10
      .sort({
        _id: -1, //sort by id in descending
      });

    if (request.length === 0) {
      return next("No Friend Requests Found.");
    } //add
    res.status(200).json({
      success: true,
      data: request, //send the req data
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const acceptRequest = async (req, res, next) => {
  try {
    const id = req.body.user.userId; //directly taking id for middle

    const { rid, status } = req.body;

    const reqExist = await FriendRequest.findById(rid);

    if (!reqExist) {
      next("No friend Request Found");
      return;
    }

    //update status of particular req
    const newRes = await FriendRequest.findByIdAndUpdate(
      { _id: rid },
      { requestStatus: status }
    );

    if (status === "Accepted") {
      const user = await Users.findById(id);

      //we have pushed second user in first user friend list
      user.friends.push(newRes?.requestFrom); //newRes return the req doc so we take requestFrom from that

      await user.save(); //save changes in db

      const friend = await Users.findById(newRes?.requestFrom);
      //find the second user
      friend.friends.push(newRes?.requestTo); //push the first user id in second user friend list
      await friend.save(); //save changes in db
    }

    res.status(201).json({
      success: true,
      message: "Friend Request " + status,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const profileViews = async (req, res) => {
  try {
    const { userId } = req.body.user; //logged in person viewing prof
    const { id } = req.body; //id of the viewed profile

    if (userId === id) {
      res.status(201).json({
        success: true,
      });
      return;
    }

    const user = await Users.findById(id);

    user.views.push(userId); //push id of logged in person in views of the user that logged in user is viewing

    await user.save();

    res.status(201).json({
      success: true,
      message: "Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const suggestedFriends = async (req, res) => {
  try {
    const { userId } = req.body.user;

    let queryObject = {};

    queryObject._id = { $ne: userId }; //exclude logged in user in suggested friends

    queryObject.friends = { $nin: userId }; //ensure users who are already friends with the current user are not included in the suggestions. logged in userid should not be in the friend list  of anyone

    let queryResult = Users.find(queryObject)
      .limit(15)
      .select("firstName lastName profileUrl profession -password");

    const suggestedFriends = await queryResult;

    res.status(200).json({
      success: true,
      data: suggestedFriends,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
